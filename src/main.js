const { spawnSync } = require("child_process")
const { app, BrowserWindow, ipcMain } = require("electron")
const { readFileSync, writeFileSync } = require("fs")
const { join } = require("path")
const { mcdir } = require("./mcutil")
const versionsLib = require("./versions/versions")
const { installMods, loadMods } = require("./mods")

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

function edit(id, window) {
    const profile = profiles.find(profile => profile.id == id)
    window.webContents.send("page", "edit")
    window.webContents.send("edit", profile)
    window.webContents.send("loadMods", mods.filter(mod => {
        for (const version of mod.versions) {
            if (version == profile.version) return true
        }
        return false
    }))
    window.webContents.send("editButton", id, true)
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

const versions = []
const profiles = loadProfiles()
const mods = []

app.on("ready", () => {
    versionsLib.loadVersions(versions, () => {
        loadMods(mods, () => {
            createWindow((window) => {
                ipcMain.on("play", (event, id) => play(id, window, mods))
                ipcMain.on("edit", (event, id) => edit(id, window, mods))
                //ipcMain.on("new", (event) => window.webContents.send("page", "edit"))
                ipcMain.on("back", (event) => window.webContents.send("page", "profiles"))
                window.webContents.send("page", "profiles")
                profiles.forEach(profile => {
                    const version = versions.find(ver => ver.id == profile.version)
                    if (version) {
                        window.webContents.send("addProfile", {
                            id: profile.id,
                            name: profile.name,
                            description: profile.description,
                            version: version.name,
                            mods: profile.mods
                        })
                    }
                })
                app.on("window-all-closed", app.quit)
            })
        })
    })
})