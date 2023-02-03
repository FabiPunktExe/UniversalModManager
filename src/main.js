const { assert } = require("console")
const { app, BrowserWindow, ipcMain, globalShortcut } = require("electron")
const { readFileSync, writeFileSync } = require("fs")
const { join } = require("path")
const versions = []
const versionsLib = require("./versions")
versionsLib.loadVersions(versions)
const mcutil = require("./mcutil")

var window = null

function getProfiles() {
    try {return JSON.parse(readFileSync(join(__dirname, "profiles.json")))}
    catch (e) {
        writeFileSync(join(__dirname, "profiles.json"), "[]")
        return getProfiles()
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
    const profiles = getProfiles();
    profiles.forEach(profile => {
        profile.version = versions.find(ver => ver.id == profile.version)
        if (profile.version !== undefined) {
            profile.version = profile.version.name
            window.webContents.send("addProfile", profile)
        }
    })
}

function play(event, data) {
    assert(window != null)
    console.log("play: " + data)
}

function run() {
    createWindow()
    ipcMain.on("play", play)
}

app.on("ready", run)
app.on("window-all-closed", app.quit)
app.on('browser-window-focus', function () {
    globalShortcut.register("CommandOrControl+R", () => {})
    globalShortcut.register("F5", () => {})
})