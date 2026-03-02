import { describe, expect, it } from 'vitest';
import { getIpcContext, runWithContext } from './context';
import type { IpcContext } from './types';

function makeContext(overrides?: Partial<IpcContext>): IpcContext {
	return {
		channel: 'test:channel',
		args: [],
		sender: { id: 1 } as IpcContext['sender'],
		event: {} as IpcContext['event'],
		...overrides,
	};
}

describe('context', () => {
	it('getIpcContext throws outside of handler', () => {
		expect(() => getIpcContext()).toThrow(
			'getIpcContext() can only be called within an IPC handler.'
		);
	});

	it('getIpcContext returns context inside runWithContext', () => {
		const ctx = makeContext({ channel: 'users:getAll', args: [1, 2] });

		runWithContext(ctx, () => {
			const result = getIpcContext();
			expect(result.channel).toBe('users:getAll');
			expect(result.args).toEqual([1, 2]);
		});
	});

	it('context is isolated between concurrent runs', async () => {
		const ctx1 = makeContext({ channel: 'a:first' });
		const ctx2 = makeContext({ channel: 'b:second' });

		const results = await Promise.all([
			new Promise<string>((resolve) => {
				runWithContext(ctx1, () => {
					// Simulate async work
					setTimeout(() => {
						resolve(getIpcContext().channel);
					}, 10);
				});
			}),
			new Promise<string>((resolve) => {
				runWithContext(ctx2, () => {
					setTimeout(() => {
						resolve(getIpcContext().channel);
					}, 5);
				});
			}),
		]);

		expect(results).toEqual(['a:first', 'b:second']);
	});

	it('nested runWithContext uses inner context', () => {
		const outer = makeContext({ channel: 'outer' });
		const inner = makeContext({ channel: 'inner' });

		runWithContext(outer, () => {
			expect(getIpcContext().channel).toBe('outer');

			runWithContext(inner, () => {
				expect(getIpcContext().channel).toBe('inner');
			});

			expect(getIpcContext().channel).toBe('outer');
		});
	});

	it('context is not accessible after runWithContext completes', () => {
		const ctx = makeContext();
		runWithContext(ctx, () => {
			expect(getIpcContext()).toBe(ctx);
		});

		expect(() => getIpcContext()).toThrow();
	});
});
