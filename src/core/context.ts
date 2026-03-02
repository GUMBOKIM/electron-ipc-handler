/**
 * IPC request context — AsyncLocalStorage-based
 *
 * Within an ipcMain.handle callback, any sync/async function in the call chain
 * can access the current request's sender, event, etc. via getIpcContext().
 */
import { AsyncLocalStorage } from 'node:async_hooks';
import type { IpcContext } from './types';

const ipcContextStorage = new AsyncLocalStorage<IpcContext>();

/**
 * Returns the context of the current IPC request.
 * Can only be used within an IPC handler call chain (controller → service → repo, etc.).
 *
 * @throws Error when called outside an IPC handler
 *
 * @example
 *   class UserService {
 *     getAll() {
 *       const { sender } = getIpcContext();
 *       console.log('Requesting window:', sender.id);
 *       return this.users;
 *     }
 *   }
 */
export function getIpcContext(): IpcContext {
	const ctx = ipcContextStorage.getStore();
	if (!ctx) {
		throw new Error('getIpcContext() can only be called within an IPC handler.');
	}
	return ctx;
}

/** @internal — Used during handler registration */
export function runWithContext<T>(ctx: IpcContext, fn: () => T): T {
	return ipcContextStorage.run(ctx, fn);
}
