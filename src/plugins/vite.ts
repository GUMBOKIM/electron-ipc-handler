import { electronExternals } from './externals';
import { type IpcDecoratorOptions, ipcDecoratorPlugin } from './unplugin';

/**
 * Vite plugin for Electron main process.
 * Injects electron/Node.js externals + runs IPC code generation.
 */
// biome-ignore lint/suspicious/noExplicitAny: Vite Plugin type compatibility across versions
export function electronIpcPlugin(options: IpcDecoratorOptions): any[] {
	return [
		{
			name: 'electron-ipc-handler:externals',
			// biome-ignore lint/suspicious/noExplicitAny: Vite UserConfig type compatibility
			config(): any {
				return {
					build: {
						rollupOptions: {
							external: electronExternals,
						},
					},
					resolve: {
						// Main process builds need 'node' condition to resolve
						// electron-ipc-handler root export to main.ts, not renderer.ts
						conditions: ['node'],
					},
				};
			},
		},
		ipcDecoratorPlugin.vite(options),
	];
}
