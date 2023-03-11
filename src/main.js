const { spawnSync } = require("child_process")
const { app, BrowserWindow, ipcMain, dialog } = require("electron")
const { readFileSync, writeFileSync } = require("fs")
const { join } = require("path")
const { mcdir } = require("./mcutil")
const versionsLib = require("./versions/versions")
const { installMods, loadMods } = require("./mods")
const moment = require("moment/moment")

function play(id, window, mods) {
    const profile = profiles.find(profile => profile.id == id)
    if (profile) {
        const version = versions.find(ver => ver.id == profile.version)
        if (version) {
            const callback = () => window.webContents.send("playButton", id, true)
            if (version.isInstalled()) callback()
            else version.install(callback)
            installMods(profile, mods)
            const launcherProfiles = JSON.parse(readFileSync(join(mcdir(), "launcher_profiles.json")))
            launcherProfiles.keepLauncherOpen = false
            launcherProfiles.profiles.umm = {
                created: moment().format("yyyy-MM-ddThh:mm:ss.000Z"),
                icon: "Gold_Block",
                lastUsed: "3000-01-01T00:00:00.000Z",
                lastVersionId: version.mcid,
                name: "UniversalModManager",
                type: "custom"
            }
            writeFileSync(join(mcdir(), "launcher_profiles.json"), JSON.stringify(launcherProfiles))
            switch(process.platform) {
                case "win32":
                    spawnSync("taskkill", ["/F", "/IM", "Minecraft.exe", "/T"])
                    setTimeout(() => {
                        spawnSync("C:\\Program Files\\WindowsApps\\Microsoft.4297127D64EC6_1.1.28.0_x64__8wekyb3d8bbwe\\Minecraft.exe")
                    }, 100)
                    break
                default:
                    spawnSync("pkill -f minecraft-launcher")
                    setTimeout(() => spawnSync("minecraft-launcher"), 100)
                    break
            }
        }
    }
}

function updateMods(window, profile) {
    window.webContents.send("loadMods", mods.filter(mod => {
        for (const version of mod.versions) {
            if (version == profile.version) return true
        }
        return false
    }).filter(mod => {
        for (const selectedMod of profile.mods) {
            console.log(mod.id + " " + selectedMod + " " + mod.id != selectedMod)
            if (mod.id == selectedMod) return false
        }
        return true
    }))
    window.webContents.send("loadSelectedMods", mods.filter(mod => {
        for (const selectedMod of profile.mods) {
            if (mod.id == selectedMod) return true
        }
        return false
    }).sort((mod1, mod2) => mod1.name > mod2.name ? -1 : mod2.name > mod1.name ? 1 : 0))
}

function edit(id, window) {
    const profile = profiles.find(profile => profile.id == id)
    window.webContents.send("page", "edit")
    window.webContents.send("edit", profile)
    updateMods(window, profile)
    window.webContents.send("editButton", id, true)
}

function updateProfiles(window) {
    window.webContents.send("loadProfiles", profiles.map(profile => {
        return {
            id: profile.id,
            name: profile.name,
            description: profile.description,
            version: versions.find(version => version.id == profile.version).name,
            mods: profile.mods
        }
    }))
}

function createWindow(callback) {
    const window = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            preload: join(__dirname, "html", "preload.js"),
            javascript: true
        }
    })
    window.setMenuBarVisibility(true)
    window.maximize()
    window.loadFile(join(__dirname, "html", "index.html")).then(() => callback(window))
}

function loadProfiles() {
    try {
        const profiles = JSON.parse(readFileSync(join(__dirname, "profiles.json")))
        profiles.filter(profile => "name"        in profile &&
                                   "description" in profile &&
                                   "id"          in profile &&
                                   "version"     in profile &&
                                   "mods"        in profile)
        return profiles
    } catch (e) {
        writeFileSync(join(__dirname, "profiles.json"), "[]")
        return loadProfiles()
    }
}

function saveProfiles() {
    try {
        writeFileSync(join(__dirname, "profiles.json"), JSON.stringify(profiles))
    } catch (e) {}
}

const versions = []
const profiles = loadProfiles()
const mods = []

app.on("ready", () => {
    versionsLib.loadVersions(versions, () => {
        loadMods(mods, () => {
            console.log(mods)
            createWindow((window) => {
                ipcMain.on("play", (event, id) => play(id, window, mods))
                ipcMain.on("edit", (event, id) => edit(id, window))
                ipcMain.on("new", event => {
                    var id = 0
                    profiles.forEach(profile => {
                        if (profile.id == id) id += 1
                    })
                    const profile = {
                        name: "Neues Profil",
                        description: "",
                        id: id,
                        version: versions[0].id,
                        mods: []
                    }
                    profiles.push(profile)
                    saveProfiles()
                    edit(id, window)
                })
                ipcMain.on("delete", (event, id) => {
                    const profile = profiles.find(profile => profile.id == id)
                    const action = dialog.showMessageBoxSync(window, {
                        message: "Möchtest du das Profil \"" + profile.name + "\" wirklich löschen?",
                        type: "none",
                        buttons: ["Ja", "Nein"],
                        defaultId: 1,
                        title: "UniversalModManager",
                        noLink: true
                    })
                    if (action == 0) {
                        profiles.splice(profiles.indexOf(profile), 1)
                        saveProfiles()
                        updateProfiles(window)
                    }
                })
                ipcMain.on("copy", (event, id) => {
                    const profile = profiles.find(profile => profile.id == id)
                    id = 0
                    profiles.forEach(profile => {
                        if (profile.id == id) id += 1
                    })
                    profiles.push({
                        name: profile.name + " - Kopie",
                        description: profile.description.slice(),
                        id: id,
                        version: profile.version.slice(),
                        mods: profile.mods.slice()
                    })
                    saveProfiles()
                    updateProfiles(window)
                })
                ipcMain.on("back", event => {
                    updateProfiles(window)
                    window.webContents.send("page", "profiles")
                })
                ipcMain.on("setName", (event, data) => {
                    profiles.find(profile => profile.id == data.id).name = data.name
                    saveProfiles(profiles)
                })
                ipcMain.on("setVersion", (event, data) => {
                    const profile = profiles.find(profile => profile.id == data.id)
                    profile.version = data.version
                    if (profile.mods.length) {
                        profile.mods.reduce((oldMods, oldMod) => {
                            var mod = mods.find(mod => mod.id == oldMod)
                            if (mod) {
                                if (profile.version in mod.versions) oldMods.push(oldMod)
                                else {
                                    mod = mods.find(newMod => newMod.name == mod.name && profile.version in newMod.versions)
                                    if (mod) oldMods.push(mod.id)
                                }
                            }
                            return oldMods
                        })
                    }
                    saveProfiles()
                    updateMods(window, profile)
                })
                ipcMain.on("setDescription", (event, data) => {
                    profiles.find(profile => profile.id == data.id).description = data.description
                    saveProfiles()
                })
                ipcMain.on("setMods", (event, data) => {
                    profiles.find(profile => profile.id == data.id).mods = data.mods
                    saveProfiles()
                })
                window.webContents.send("page", "profiles")
                window.webContents.send("loadVersions", versions.map(version => {
                    return {
                        id: version.id,
                        name: version.name
                    }
                }))
                updateProfiles(window)
                app.on("window-all-closed", app.quit)
            })
        })
    })
})