const { assert } = require("console")
const { app, BrowserWindow, ipcMain, globalShortcut } = require("electron")
const { readFileSync, writeFileSync } = require("fs")
const { join } = require("path")

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
    profiles.forEach(profile => window.webContents.send("addProfile", profile))
    console.log(profiles)
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