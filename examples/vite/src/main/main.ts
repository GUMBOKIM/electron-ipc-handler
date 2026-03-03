import { join } from 'node:path';
import { BrowserWindow, app } from 'electron';
import { registerIpcDecoratorHandler } from './ipc/ipc.gen';

function createWindow() {
	const win = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			preload: join(__dirname, '../preload/preload.cjs'),
			contextIsolation: true,
			nodeIntegration: false,
		},
	});

	win.loadFile(join(__dirname, '../renderer/index.html'));
}

app.whenReady().then(() => {
	registerIpcDecoratorHandler();
	createWindow();

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit();
});
