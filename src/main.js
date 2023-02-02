const { assert } = require("console");
const { app, BrowserWindow, ipcMain, globalShortcut } = require("electron");
const { join } = require("path");
var window = null;

function play(event, data) {
    assert(window != null);
    console.log("play: " + data);
}

function createWindow() {
    window = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            preload: join(__dirname, "preload.js")
        }
    });
    window.setMenuBarVisibility(true);
    window.maximize();
    window.loadFile(join(__dirname, "profiles.html"));
}

function run() {
    createWindow();
    ipcMain.on("play", play);
    window.webContents.send("addProfile", {name: "testname", description: "test", id: 1});
    window.webContents.send("addProfile", {name: "testname2", description: "test2", id: 2});
}

app.on("ready", run);
app.on("window-all-closed", app.quit);
app.on('browser-window-focus', function () {
    globalShortcut.register("CommandOrControl+R", () => {});
    globalShortcut.register("F5", () => {});
});