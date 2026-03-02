import { describe, expect, it } from 'vitest';

import { electronIpcPlugin } from './esbuild';

const dummyOptions = { dirs: ['src/handlers'], output: 'src/ipc.gen.ts' };

function createMockBuild(external?: string[]) {
	return {
		initialOptions: {
			platform: undefined as string | undefined,
			external,
		},
		onStart: () => {},
		onEnd: () => {},
		onResolve: () => {},
		onLoad: () => {},
	};
}

describe('esbuild plugin', () => {
	it('sets platform and externals in setup', () => {
		const plugin = electronIpcPlugin(dummyOptions);
		expect(plugin.name).toBe('electron-ipc-handler');

		const build = createMockBuild(undefined);
		plugin.setup(build);

		expect(build.initialOptions.platform).toBe('node');
		expect(build.initialOptions.external).toContain('electron');
		expect(build.initialOptions.external).toContain('fs');
		expect(build.initialOptions.external).toContain('node:fs');
	});

	it('preserves existing externals', () => {
		const plugin = electronIpcPlugin(dummyOptions);
		const build = createMockBuild(['my-external']);

		plugin.setup(build);

		expect(build.initialOptions.external).toContain('my-external');
		expect(build.initialOptions.external).toContain('electron');
	});
});
