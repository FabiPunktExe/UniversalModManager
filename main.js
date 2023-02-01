const { app, BrowserWindow } = require('electron');

function createWindow() {
    const mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        }
    });
    mainWindow.maximize();
    mainWindow.loadFile('index.html');
}

function run() {
    createWindow();
}

app.on('ready', run);
app.on('window-all-closed', app.quit);
app.on('activate', createWindow);