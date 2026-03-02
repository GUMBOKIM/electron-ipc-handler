import { beforeEach, describe, expect, it } from 'vitest';
import { ipcHandler } from './handler';
import { fnRegistry } from './registry';

describe('ipcHandler', () => {
	beforeEach(() => {
		fnRegistry.length = 0;
	});

	it('returns IpcFnDef with correct tag, channel, and fn', () => {
		const fn = (msg: string) => `pong: ${msg}`;
		const def = ipcHandler('system:ping', fn);

		expect(def._tag).toBe('ipc-fn');
		expect(def.channel).toBe('system:ping');
		expect(def.fn).toBe(fn);
	});

	it('registers the handler in fnRegistry', () => {
		const fn = () => 42;
		ipcHandler('math:answer', fn);

		expect(fnRegistry).toHaveLength(1);
		expect(fnRegistry[0].channel).toBe('math:answer');
		expect(fnRegistry[0].fn).toBe(fn);
	});

	it('registers multiple handlers in order', () => {
		ipcHandler('a:first', () => 1);
		ipcHandler('b:second', () => 2);

		expect(fnRegistry).toHaveLength(2);
		expect(fnRegistry[0].channel).toBe('a:first');
		expect(fnRegistry[1].channel).toBe('b:second');
	});

	it('works with async functions', async () => {
		const fn = async (x: number) => x * 2;
		const def = ipcHandler('async:double', fn);

		const result = await def.fn(5);
		expect(result).toBe(10);
	});
});
