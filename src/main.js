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

const profiles = getProfiles();

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
}

function play(event, id) {
    assert(window != null)
    const profile = profiles.find(profile => profile.id == id)
    if (profile) {
        const version = versions.find(ver => ver.id == profile.version)
        if (version) {
            const callback = () => {
                window.webContents.send("playButton", id, true)
            }
            if (version.isInstalled()) callback()
            else version.install(callback)
        }
    }
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