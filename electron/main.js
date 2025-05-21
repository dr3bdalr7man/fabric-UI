const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('run-pattern', async (evt, { name, vars }) => {
  // Example invocation of the fabric CLI. This assumes `fabric` is in PATH.
  // Replace with actual command as needed.
  return new Promise((resolve) => {
    const args = ['--pattern', name];
    for (const [k, v] of Object.entries(vars)) {
      args.push('-v', `${k}:${v}`);
    }
    const proc = spawn('fabric', args);
    let output = '';
    proc.stdout.on('data', (d) => {
      output += d.toString();
    });
    proc.on('close', () => resolve(output));
  });
});
