import { beforeEach, describe, expect, it } from 'vitest';
import { classRegistry, fnRegistry } from './registry';

describe('registry', () => {
	beforeEach(() => {
		classRegistry.length = 0;
		fnRegistry.length = 0;
	});

	describe('classRegistry', () => {
		it('starts empty', () => {
			expect(classRegistry).toHaveLength(0);
		});

		it('accepts class entries', () => {
			class Dummy {}
			classRegistry.push({
				namespace: 'test',
				target: Dummy,
				methods: [{ channel: 'foo', propertyKey: 'foo' }],
			});

			expect(classRegistry).toHaveLength(1);
			expect(classRegistry[0].namespace).toBe('test');
			expect(classRegistry[0].target).toBe(Dummy);
			expect(classRegistry[0].methods).toEqual([{ channel: 'foo', propertyKey: 'foo' }]);
		});

		it('supports multiple entries', () => {
			class A {}
			class B {}
			classRegistry.push(
				{ namespace: 'a', target: A, methods: [] },
				{ namespace: 'b', target: B, methods: [] }
			);

			expect(classRegistry).toHaveLength(2);
		});

		it('resets via length = 0', () => {
			class C {}
			classRegistry.push({ namespace: 'c', target: C, methods: [] });
			expect(classRegistry).toHaveLength(1);

			classRegistry.length = 0;
			expect(classRegistry).toHaveLength(0);
		});
	});

	describe('fnRegistry', () => {
		it('starts empty', () => {
			expect(fnRegistry).toHaveLength(0);
		});

		it('accepts function entries', () => {
			const fn = () => 'hello';
			fnRegistry.push({ channel: 'system:ping', fn });

			expect(fnRegistry).toHaveLength(1);
			expect(fnRegistry[0].channel).toBe('system:ping');
			expect(fnRegistry[0].fn).toBe(fn);
		});

		it('supports multiple entries', () => {
			fnRegistry.push({ channel: 'a:one', fn: () => 1 }, { channel: 'b:two', fn: () => 2 });

			expect(fnRegistry).toHaveLength(2);
		});
	});
});
