import { beforeEach, describe, expect, it, vi } from 'vitest';

// vi.hoisted runs before vi.mock hoisting, so handleMock is initialized first
const { handleMock } = vi.hoisted(() => ({ handleMock: vi.fn() }));
vi.mock('electron', () => ({
	ipcMain: { handle: handleMock },
}));

import { classRegistry, fnRegistry } from './core/registry';
import { registerIpcDecoratorHandler } from './main';

describe('registerIpcDecoratorHandler', () => {
	beforeEach(() => {
		classRegistry.length = 0;
		fnRegistry.length = 0;
		handleMock.mockClear();
	});

	it('registers class handler methods on ipcMain.handle', () => {
		class TestController {
			getAll() {
				return [1, 2, 3];
			}
		}

		classRegistry.push({
			namespace: 'test',
			target: TestController,
			methods: [{ channel: 'getAll', propertyKey: 'getAll' }],
		});

		registerIpcDecoratorHandler();

		expect(handleMock).toHaveBeenCalledTimes(1);
		expect(handleMock).toHaveBeenCalledWith('test:getAll', expect.any(Function));
	});

	it('registers function handlers on ipcMain.handle', () => {
		const fn = (msg: string) => `pong: ${msg}`;
		fnRegistry.push({ channel: 'system:ping', fn });

		registerIpcDecoratorHandler();

		expect(handleMock).toHaveBeenCalledTimes(1);
		expect(handleMock).toHaveBeenCalledWith('system:ping', expect.any(Function));
	});

	it('class handler invocation returns correct value', async () => {
		class UserCtrl {
			list() {
				return ['alice', 'bob'];
			}
		}

		classRegistry.push({
			namespace: 'users',
			target: UserCtrl,
			methods: [{ channel: 'list', propertyKey: 'list' }],
		});

		registerIpcDecoratorHandler();

		// Get the registered callback and invoke it
		const callback = handleMock.mock.calls[0][1];
		const event = { sender: { id: 1 } };
		const result = await callback(event);

		expect(result).toEqual(['alice', 'bob']);
	});

	it('function handler invocation returns correct value', async () => {
		fnRegistry.push({ channel: 'math:add', fn: (a: number, b: number) => a + b });

		registerIpcDecoratorHandler();

		const callback = handleMock.mock.calls[0][1];
		const event = { sender: { id: 1 } };
		const result = await callback(event, 3, 5);

		expect(result).toBe(8);
	});

	it('uses resolver to create class instances', () => {
		class SvcCtrl {
			greet() {
				return 'hi';
			}
		}

		const mockInstance = { greet: () => 'resolved hi' };
		const resolver = vi.fn().mockReturnValue(mockInstance);

		classRegistry.push({
			namespace: 'svc',
			target: SvcCtrl,
			methods: [{ channel: 'greet', propertyKey: 'greet' }],
		});

		registerIpcDecoratorHandler({ resolver });

		expect(resolver).toHaveBeenCalledWith(SvcCtrl);
	});

	it('resolver handler returns resolved instance value', async () => {
		class Ctrl {
			hello() {
				return 'default';
			}
		}

		const mockInstance = { hello: () => 'injected' };
		const resolver = vi.fn().mockReturnValue(mockInstance);

		classRegistry.push({
			namespace: 'ns',
			target: Ctrl,
			methods: [{ channel: 'hello', propertyKey: 'hello' }],
		});

		registerIpcDecoratorHandler({ resolver });

		const callback = handleMock.mock.calls[0][1];
		const result = await callback({ sender: { id: 1 } });
		expect(result).toBe('injected');
	});

	it('interceptors wrap handler execution', async () => {
		const log: string[] = [];

		fnRegistry.push({
			channel: 'test:run',
			fn: () => {
				log.push('handler');
				return 'ok';
			},
		});

		registerIpcDecoratorHandler({
			interceptors: [
				async (ctx, next) => {
					log.push('before');
					const result = await next();
					log.push('after');
					return result;
				},
			],
		});

		const callback = handleMock.mock.calls[0][1];
		const result = await callback({ sender: { id: 1 } });

		expect(result).toBe('ok');
		expect(log).toEqual(['before', 'handler', 'after']);
	});

	it('multiple interceptors execute in order', async () => {
		const log: string[] = [];

		fnRegistry.push({ channel: 'chain:test', fn: () => 'done' });

		registerIpcDecoratorHandler({
			interceptors: [
				async (_ctx, next) => {
					log.push('A-in');
					const r = await next();
					log.push('A-out');
					return r;
				},
				async (_ctx, next) => {
					log.push('B-in');
					const r = await next();
					log.push('B-out');
					return r;
				},
			],
		});

		const callback = handleMock.mock.calls[0][1];
		await callback({ sender: { id: 1 } });

		expect(log).toEqual(['A-in', 'B-in', 'B-out', 'A-out']);
	});

	it('registers both class and function handlers', () => {
		class MyCtrl {
			run() {}
		}

		classRegistry.push({
			namespace: 'my',
			target: MyCtrl,
			methods: [{ channel: 'run', propertyKey: 'run' }],
		});
		fnRegistry.push({ channel: 'sys:ping', fn: () => 'pong' });

		registerIpcDecoratorHandler();

		expect(handleMock).toHaveBeenCalledTimes(2);
		expect(handleMock).toHaveBeenCalledWith('my:run', expect.any(Function));
		expect(handleMock).toHaveBeenCalledWith('sys:ping', expect.any(Function));
	});
});
