import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createIpcClient } from './renderer';

describe('createIpcClient', () => {
	const invokeMock = vi.fn();

	beforeEach(() => {
		invokeMock.mockReset();

		// Mock window.electron.ipcRenderer.invoke
		// biome-ignore lint/suspicious/noExplicitAny: test mock setup
		(globalThis as any).window = {
			electron: {
				ipcRenderer: { invoke: invokeMock },
			},
		};
	});

	afterEach(() => {
		// biome-ignore lint/suspicious/noExplicitAny: cleanup test mock
		(globalThis as any).window = undefined;
	});

	it('calls ipcRenderer.invoke with namespace:method format', async () => {
		invokeMock.mockResolvedValue(['alice', 'bob']);

		const api = createIpcClient<{ users: { getAll: () => Promise<string[]> } }>();
		const result = await api.users.getAll();

		expect(invokeMock).toHaveBeenCalledWith('users:getAll');
		expect(result).toEqual(['alice', 'bob']);
	});

	it('passes arguments through to invoke', async () => {
		invokeMock.mockResolvedValue({ id: 1, name: 'alice' });

		const api = createIpcClient<{
			users: { getById: (id: number) => Promise<{ id: number; name: string }> };
		}>();
		await api.users.getById(1);

		expect(invokeMock).toHaveBeenCalledWith('users:getById', 1);
	});

	it('supports multiple namespaces', async () => {
		invokeMock.mockResolvedValue('ok');

		const api = createIpcClient<{
			users: { list: () => Promise<string> };
			items: { count: () => Promise<string> };
		}>();

		await api.users.list();
		await api.items.count();

		expect(invokeMock).toHaveBeenCalledWith('users:list');
		expect(invokeMock).toHaveBeenCalledWith('items:count');
	});

	it('caches namespace proxies', () => {
		const api = createIpcClient<{
			users: { a: () => Promise<void>; b: () => Promise<void> };
		}>();

		// Same namespace reference should be cached
		const ref1 = api.users;
		const ref2 = api.users;
		expect(ref1).toBe(ref2);
	});

	it('throws when window.electron is not available', () => {
		// Set window without electron property (deleting window throws ReferenceError in Node)
		// biome-ignore lint/suspicious/noExplicitAny: test mock setup
		(globalThis as any).window = {};

		expect(() => {
			const api = createIpcClient<{ ns: { method: () => Promise<void> } }>();
			// Proxy access triggers getElectronApi()
			api.ns.method();
		}).toThrow('window.electron.ipcRenderer.invoke is not available');
	});

	it('passes multiple arguments', async () => {
		invokeMock.mockResolvedValue(8);

		const api = createIpcClient<{
			math: { add: (a: number, b: number) => Promise<number> };
		}>();
		const result = await api.math.add(3, 5);

		expect(invokeMock).toHaveBeenCalledWith('math:add', 3, 5);
		expect(result).toBe(8);
	});
});
