import { electronExternals } from './externals';
import { type IpcDecoratorOptions, ipcDecoratorPlugin } from './unplugin';

/**
 * Rollup plugin for Electron main process.
 * Merges electron/Node.js externals + runs IPC code generation.
 */
// biome-ignore lint/suspicious/noExplicitAny: Rollup Plugin type compatibility across versions
export function electronIpcPlugin(options: IpcDecoratorOptions): any[] {
	const externalsSet = new Set(electronExternals);

	return [
		{
			name: 'electron-ipc-handler:externals',
			// biome-ignore lint/suspicious/noExplicitAny: Rollup InputOptions type compatibility
			options(inputOptions: any) {
				const existingExternal = inputOptions.external;

				inputOptions.external = (id: string) => {
					if (externalsSet.has(id)) return true;
					if (typeof existingExternal === 'function') return existingExternal(id);
					if (Array.isArray(existingExternal)) return existingExternal.includes(id);
					return false;
				};

				return inputOptions;
			},
		},
		ipcDecoratorPlugin.rollup(options),
	];
}
