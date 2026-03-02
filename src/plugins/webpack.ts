import { electronExternals } from './externals';
import { type IpcDecoratorOptions, ipcDecoratorPlugin } from './unplugin';

/**
 * webpack plugin for Electron main process.
 * Adds electron/Node.js externals + runs IPC code generation.
 */
export class ElectronIpcPlugin {
	private codegenPlugin: ReturnType<typeof ipcDecoratorPlugin.webpack>;

	constructor(private options: IpcDecoratorOptions) {
		this.codegenPlugin = ipcDecoratorPlugin.webpack(options);
	}

	// biome-ignore lint/suspicious/noExplicitAny: webpack Compiler type compatibility
	apply(compiler: any): void {
		// Merge electron externals into compiler options
		const existing = compiler.options.externals;
		if (Array.isArray(existing)) {
			existing.push(...electronExternals);
		} else if (existing) {
			compiler.options.externals = [existing, ...electronExternals];
		} else {
			compiler.options.externals = [...electronExternals];
		}

		// Delegate codegen plugin
		this.codegenPlugin.apply(compiler);
	}
}

export function electronIpcPlugin(options: IpcDecoratorOptions): ElectronIpcPlugin {
	return new ElectronIpcPlugin(options);
}
