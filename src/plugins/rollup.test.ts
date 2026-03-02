import { describe, expect, it } from 'vitest';

import { electronIpcPlugin } from './rollup';

const dummyOptions = { dirs: ['src/handlers'], output: 'src/ipc.gen.ts' };

describe('rollup plugin', () => {
	it('returns an array of plugins', () => {
		const plugins = electronIpcPlugin(dummyOptions);
		expect(Array.isArray(plugins)).toBe(true);
		expect(plugins.length).toBe(2);
	});

	it('first plugin provides options hook that externalizes electron/builtins', () => {
		const plugins = electronIpcPlugin(dummyOptions);
		const externalsPlugin = plugins[0];
		expect(externalsPlugin.name).toBe('electron-ipc-handler:externals');

		const inputOptions = { external: [] as string[] };
		externalsPlugin.options(inputOptions);

		expect(typeof inputOptions.external).toBe('function');
		const externalFn = inputOptions.external as unknown as (id: string) => boolean;
		expect(externalFn('electron')).toBe(true);
		expect(externalFn('fs')).toBe(true);
		expect(externalFn('node:path')).toBe(true);
		expect(externalFn('some-package')).toBe(false);
	});
});
