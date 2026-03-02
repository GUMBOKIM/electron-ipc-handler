import { describe, expect, it } from 'vitest';

import { electronIpcPlugin } from './webpack';

const dummyOptions = { dirs: ['src/handlers'], output: 'src/ipc.gen.ts' };

function createMockCompiler(externals?: unknown) {
	return {
		options: { externals },
		hooks: {
			make: { tapPromise: () => {} },
			watchRun: { tapPromise: () => {} },
			compilation: { tap: () => {} },
		},
	};
}

describe('webpack plugin', () => {
	it('merges externals into compiler options', () => {
		const plugin = electronIpcPlugin(dummyOptions);
		const compiler = createMockCompiler(undefined);

		plugin.apply(compiler);

		expect(Array.isArray(compiler.options.externals)).toBe(true);
		expect(compiler.options.externals).toContain('electron');
		expect(compiler.options.externals).toContain('fs');
		expect(compiler.options.externals).toContain('node:fs');
	});

	it('preserves existing array externals', () => {
		const plugin = electronIpcPlugin(dummyOptions);
		const compiler = createMockCompiler(['my-external']);

		plugin.apply(compiler);

		expect(compiler.options.externals).toContain('my-external');
		expect(compiler.options.externals).toContain('electron');
	});
});
