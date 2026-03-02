import { builtinModules } from 'node:module';
import { describe, expect, it } from 'vitest';

import { electronExternals } from './externals';

describe('externals', () => {
	it('includes electron', () => {
		expect(electronExternals).toContain('electron');
	});

	it('includes Node builtins', () => {
		expect(electronExternals).toContain('fs');
		expect(electronExternals).toContain('path');
		expect(electronExternals).toContain('node:fs');
		expect(electronExternals).toContain('node:path');
	});

	it('includes all builtinModules and their node: prefixed variants', () => {
		for (const mod of builtinModules) {
			expect(electronExternals).toContain(mod);
			expect(electronExternals).toContain(`node:${mod}`);
		}
	});
});
