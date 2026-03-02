import type { IpcMainInvokeEvent } from 'electron';

/** Method metadata — collected by ipcMethod decorator */
export interface MethodMeta {
	channel: string;
	propertyKey: string;
}

/** Class handler info stored in the global registry */
export interface ClassEntry {
	namespace: string;
	target: new (
		// biome-ignore lint/suspicious/noExplicitAny: generic constructor type
		...args: any[]
		// biome-ignore lint/suspicious/noExplicitAny: constructor return type
	) => any;
	methods: MethodMeta[];
}

/** Function handler info stored in the global registry */
export interface FnEntry {
	channel: string;
	// biome-ignore lint/suspicious/noExplicitAny: handler signature unrestricted
	fn: (...args: any[]) => any;
}

/** Type-safe definition object returned by ipcHandler() */
export interface IpcFnDef<TArgs extends unknown[] = unknown[], TReturn = unknown> {
	readonly _tag: 'ipc-fn';
	readonly channel: string;
	readonly fn: (...args: TArgs) => TReturn | Promise<TReturn>;
}

/**
 * IPC request context — accessible throughout the handler call chain
 *
 * Passed to interceptors and also queryable via getIpcContext().
 */
export interface IpcContext {
	/** IPC channel name (e.g., 'users:getAll') */
	channel: string;
	/** Invocation arguments */
	args: unknown[];
	/** WebContents of the requesting window */
	sender: IpcMainInvokeEvent['sender'];
	/** Original IPC event */
	event: IpcMainInvokeEvent;
}

/** IPC interceptor — koa-style middleware */
export type IpcInterceptor = (ctx: IpcContext, next: () => Promise<unknown>) => Promise<unknown>;

/** registerIpcDecoratorHandler options */
export interface RegisterOptions {
	/**
	 * Class instance factory.
	 * Defaults to `new target()` when not specified (works without DI).
	 *
	 * @example tsyringe
	 * resolver: (Target) => container.resolve(Target)
	 *
	 * @example inversify
	 * resolver: (Target) => container.get(Target)
	 */
	// biome-ignore lint/suspicious/noExplicitAny: generic constructor/instance type
	resolver?: (target: new (...args: any[]) => any) => any;
	/** Request/response interceptor array (executed in order) */
	interceptors?: IpcInterceptor[];
}
