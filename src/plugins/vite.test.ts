import { describe, expect, it } from 'vitest';

import { electronExternals } from './externals';
import { electronIpcPlugin } from './vite';

const dummyOptions = { dirs: ['src/handlers'], output: 'src/ipc.gen.ts' };

describe('vite plugin', () => {
	it('returns an array of plugins', () => {
		const plugins = electronIpcPlugin(dummyOptions);
		expect(Array.isArray(plugins)).toBe(true);
		expect(plugins.length).toBe(2);
	});

	it('first plugin injects externals via config hook', () => {
		const plugins = electronIpcPlugin(dummyOptions);
		const externalsPlugin = plugins[0];
		expect(externalsPlugin.name).toBe('electron-ipc-handler:externals');

		const config = externalsPlugin.config();
		expect(config.build.rollupOptions.external).toEqual(electronExternals);
	});
});
