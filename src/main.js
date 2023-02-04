const { app, BrowserWindow, ipcMain, globalShortcut } = require("electron")
const { readFileSync, writeFileSync } = require("fs")
const { join } = require("path")
const versionsLib = require("./versions")

function play(id, window) {
    const profile = profiles.find(profile => profile.id == id)
    if (profile) {
        const version = versions.find(ver => ver.id == profile.version)
        if (version) {
            const callback = () => window.webContents.send("playButton", id, true)
            if (version.isInstalled()) callback()
            else version.install(callback)
        }
    }
}

function createWindow() {
    window = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            preload: join(__dirname, "preload.js")
        }
    })
    window.setMenuBarVisibility(true)
    window.maximize()
    window.loadFile(join(__dirname, "profiles.html"))
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

app.on("ready", () => {
    versionsLib.loadVersions(versions, () => {
        const window = createWindow()
        ipcMain.on("play", (event, id) => play(id, window))
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
        app.on('browser-window-focus', function () {
            globalShortcut.register("CommandOrControl+R", () => {})
            globalShortcut.register("F5", () => {})
        })
    })
})