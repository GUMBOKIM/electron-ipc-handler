/**
 * Preload helper — exposes ipcRenderer.invoke to the renderer process.
 *
 * @example
 * // preload.ts
 * import { setupPreload } from 'electron-ipc-handler/preload';
 * setupPreload();
 */
import { contextBridge, ipcRenderer } from 'electron';

export function setupPreload(): void {
	contextBridge.exposeInMainWorld('electron', {
		ipcRenderer: {
			invoke: (channel: string, ...args: unknown[]) => ipcRenderer.invoke(channel, ...args),
		},
	});
}
