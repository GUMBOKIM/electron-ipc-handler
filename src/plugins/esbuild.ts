import { electronExternals } from './externals';
import { type IpcDecoratorOptions, ipcDecoratorPlugin } from './unplugin';

/**
 * esbuild plugin for Electron main process.
 * Sets platform to 'node', adds electron/Node.js externals + runs IPC code generation.
 */
// biome-ignore lint/suspicious/noExplicitAny: esbuild Plugin type compatibility across versions
export function electronIpcPlugin(options: IpcDecoratorOptions): any {
	const codegenPlugin = ipcDecoratorPlugin.esbuild(options);

	return {
		name: 'electron-ipc-handler',
		// biome-ignore lint/suspicious/noExplicitAny: esbuild PluginBuild type compatibility
		setup(build: any) {
			// Set platform to node for Electron main process
			build.initialOptions.platform = 'node';

			// Merge electron externals
			const existing = build.initialOptions.external ?? [];
			const merged = new Set([...existing, ...electronExternals]);
			build.initialOptions.external = [...merged];

			// Delegate codegen plugin setup
			codegenPlugin.setup(build);
		},
	};
}
