/**
 * Function-based IPC handler wrapper
 *
 * Registers standalone functions as type-safe IPC handlers.
 * Uses a function wrapper approach since TypeScript doesn't support decorators on standalone functions.
 */
import { fnRegistry } from './registry';
import type { IpcFnDef } from './types';

/**
 * Registers a function as an IPC handler and returns a type-safe definition object.
 *
 * @example
 * export const ping = ipcHandler('system:ping', (msg: string) => `pong: ${msg}`);
 */
export function ipcHandler<TArgs extends unknown[], TReturn>(
	channel: string,
	fn: (...args: TArgs) => TReturn | Promise<TReturn>
): IpcFnDef<TArgs, TReturn> {
	fnRegistry.push({ channel, fn });
	return { _tag: 'ipc-fn', channel, fn } as const;
}
