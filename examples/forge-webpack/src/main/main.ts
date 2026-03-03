import { BrowserWindow, app } from 'electron';
import { registerIpcDecoratorHandler } from './ipc/ipc.gen';

function createWindow() {
	const win = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
			contextIsolation: true,
			nodeIntegration: false,
		},
	});

	win.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
}

declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;

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
