const { app, BrowserWindow } = require("electron");
const { join } = require("path");

function createWindow() {
    const mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        }
    });
    mainWindow.maximize();
    mainWindow.loadFile(join(__dirname, "index.html"));
}

function run() {
    createWindow();
}

app.on("ready", run);
app.on("window-all-closed", app.quit);
app.on("activate", createWindow);