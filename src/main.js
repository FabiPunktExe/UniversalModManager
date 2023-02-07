const { spawnSync } = require("child_process")
const { app, BrowserWindow, ipcMain, globalShortcut } = require("electron")
const { readFileSync, writeFileSync } = require("fs")
const { join } = require("path")
const { get } = require("request")
const request = require("request")
const { mcdir } = require("./mcutil")
const versionsLib = require("./versions")

function play(id, window) {
    const profile = profiles.find(profile => profile.id == id)
    if (profile) {
        const version = versions.find(ver => ver.id == profile.version)
        if (version) {
            const callback = () => window.webContents.send("playButton", id, true)
            if (version.isInstalled()) callback()
            else version.install(callback)
            const launcherProfiles = JSON.parse(readFileSync(join(mcdir(), "launcher_profiles.json")))
            launcherProfiles.keepLauncherOpen = false
            launcherProfiles.profiles.umm = {
                created: "3000-01-01T00:00:00.000Z",
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
    window.webContents.send("page", "edit")
    window.webContents.send("edit", id, true)
    window.webContents.send("loadMods", mods)
}

function createWindow() {
    const window = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            preload: join(__dirname, "preload.js")
        }
    })
    window.setMenuBarVisibility(true)
    window.maximize()
    window.loadFile(join(__dirname, "index.html"))
    return window
}

function loadProfiles() {
    try {return JSON.parse(readFileSync(join(__dirname, "profiles.json")))}
    catch (e) {
        writeFileSync(join(__dirname, "profiles.json"), "[]")
        return loadProfiles()
    }
}

const versions = []
const profiles = loadProfiles()
const mods = []

function loadMods(callback) {
    get("https://mrstupsi.github.io/UniversalModManager/mods.txt", {}, (error, response, body) => {
        const lines = body.split("\n")
        lines.forEach(line => {
            if (!line.startsWith("//")) {
                const data = line.split(";")
                mods.push({
                    name: data[0],
                    id: data[1],
                    url: data[2],
                    versions: data[3] == "" ? [] : data[3].split(","),
                    dependencies: data[4] == "" ? [] : data[4].split(",")
                })
            }
        })
        callback()
    })
}

app.on("ready", () => {
    versionsLib.loadVersions(versions, () => {
        loadMods(() => {
            const window = createWindow()
            ipcMain.on("play", (event, id) => play(id, window))
            ipcMain.on("edit", (event, id) => edit(id, window))
            window.webContents.send("page", "profiles")
            profiles.forEach(profile => {
                const version = versions.find(ver => ver.id == profile.version)
                if (version) {
                    window.webContents.send("addProfile", {
                        id: profile.id,
                        name: profile.name,
                        description: profile.description,
                        version: version.name
                    })
                }
            })
            app.on("window-all-closed", app.quit)
            /*app.on('browser-window-focus', function () {shortc
                globalShortcut.register("CommandOrControl+R", () => {})
                globalShortcut.register("F5", () => {})
            })*/
        })
    })
})