/**
 * Electron IPC Handler — Main Process
 *
 * Based on TC39 standard decorators. DI-framework independent.
 *
 * @example Without DI
 *   @ipcClass('users')
 *   class UserController {
 *     @ipcMethod()
 *     getAll() { ... }
 *   }
 *   registerIpcDecoratorHandler();
 *
 * @example With DI (tsyringe)
 *   registerIpcDecoratorHandler({
 *     resolver: (Target) => container.resolve(Target),
 *   });
 *
 * @example Interceptors
 *   registerIpcDecoratorHandler({
 *     interceptors: [loggingInterceptor, authInterceptor],
 *   });
 *
 * @example Accessing IPC context from a service
 *   class UserService {
 *     getAll() {
 *       const { sender } = getIpcContext();
 *       sender.send('notification', 'Loading...');
 *       return this.users;
 *     }
 *   }
 */
import { ipcMain } from 'electron';
import { runWithContext } from './core/context';
import { classRegistry, fnRegistry } from './core/registry';
import type { IpcContext, IpcInterceptor, RegisterOptions } from './core/types';

// Re-export decorators + handler + context
export { getIpcContext } from './core/context';
export { ipcClass, ipcMethod } from './core/decorators';
export { ipcHandler } from './core/handler';
export type {
	IpcContext,
	IpcFnDef,
	IpcInterceptor,
	RegisterOptions,
} from './core/types';

// Re-export renderer client + type utilities (safe — no electron import)
export { createIpcClient } from './renderer';
export type { ExtractIpcFn, InferApi } from './renderer';

/**
 * Composes an array of interceptors into a koa-style middleware chain.
 * [A, B, C] → A(ctx, () => B(ctx, () => C(ctx, () => handler())))
 *
 * Runs inside AsyncLocalStorage context, so
 * getIpcContext() is available within interceptors.
 */
function composeInterceptors(
	interceptors: IpcInterceptor[],
	// biome-ignore lint/suspicious/noExplicitAny: handler return type unrestricted
	handler: (...args: any[]) => any,
	channel: string
	// biome-ignore lint/suspicious/noExplicitAny: IPC event type
): (event: any, ...args: unknown[]) => Promise<unknown> {
	return (event, ...args) => {
		const ctx: IpcContext = { channel, args, sender: event.sender, event };
		return runWithContext(ctx, async () => {
			let idx = -1;

			const dispatch = async (i: number): Promise<unknown> => {
				if (i <= idx) throw new Error('next() called multiple times');
				idx = i;
				if (i < interceptors.length) {
					return interceptors[i](ctx, () => dispatch(i + 1));
				}
				return handler(...ctx.args);
			};

			return dispatch(0);
		});
	};
}

/**
 * Connects all handlers in the registry to ipcMain.handle.
 *
 * All handlers run inside AsyncLocalStorage context, so
 * getIpcContext() is accessible anywhere in the call chain (controller → service → repo).
 *
 * @param options.resolver Class instance factory (for DI integration). Defaults to `new target()`.
 * @param options.interceptors Array of interceptors (executed in order).
 */
export function registerIpcDecoratorHandler(options?: RegisterOptions): void {
	const { resolver, interceptors } = options ?? {};

	// Register class handlers
	for (const entry of classRegistry) {
		const instance = resolver ? resolver(entry.target) : new entry.target();

		for (const method of entry.methods) {
			const channel = `${entry.namespace}:${method.channel}`;
			// biome-ignore lint/suspicious/noExplicitAny: dynamic method access
			const handler = (instance as any)[method.propertyKey].bind(instance);

			if (interceptors?.length) {
				ipcMain.handle(channel, composeInterceptors(interceptors, handler, channel));
			} else {
				ipcMain.handle(channel, (event, ...args) =>
					runWithContext({ channel, args, sender: event.sender, event }, () => handler(...args))
				);
			}
		}
	}

	// Register function handlers
	for (const entry of fnRegistry) {
		if (interceptors?.length) {
			ipcMain.handle(entry.channel, composeInterceptors(interceptors, entry.fn, entry.channel));
		} else {
			ipcMain.handle(entry.channel, (event, ...args) =>
				runWithContext({ channel: entry.channel, args, sender: event.sender, event }, () =>
					entry.fn(...args)
				)
			);
		}
	}
}
