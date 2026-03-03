import { app } from 'electron';
import { ipcHandler } from 'electron-ipc-handler';

export const ping = ipcHandler('system:ping', (msg: string): string => {
	return `pong: ${msg}`;
});

export const getVersion = ipcHandler('system:getVersion', (): string => {
	return app.getVersion();
});
