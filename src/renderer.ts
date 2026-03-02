/**
 * Electron IPC Client — Renderer Process
 *
 * Uses Proxy to auto-convert api.namespace.method() → ipcRenderer.invoke('namespace:method').
 * No preload modification required.
 */
import type { IpcFnDef } from './core/types';

// ─── Type Utilities ──────────────────────────────────────

/**
 * Extracts public methods from a class instance and wraps them in Promise.
 * Corresponds to methods decorated with @ipcMethod.
 */
type ExtractHandlers<T> = {
	// biome-ignore lint/suspicious/noExplicitAny: required for method signature inference
	[K in keyof T as T[K] extends (...args: any[]) => any ? K : never]: T[K] extends (
		...args: infer A
	) => infer R
		? (...args: A) => Promise<Awaited<R>>
		: never;
};

/** Infers API types from a class controller map */
export type InferApi<T extends Record<string, object>> = {
	[NS in keyof T]: ExtractHandlers<T[NS]>;
};

/** Extracts function signature from ipcHandler() return value */
export type ExtractIpcFn<T> = T extends IpcFnDef<infer A, infer R>
	? (...args: A) => Promise<Awaited<R>>
	: never;

// ─── Client ─────────────────────────────────────────────

interface ElectronApi {
	ipcRenderer: {
		invoke(channel: string, ...args: unknown[]): Promise<unknown>;
	};
}

function getElectronApi(): ElectronApi {
	const api = (window as unknown as Record<string, unknown>).electron as ElectronApi | undefined;
	if (!api?.ipcRenderer?.invoke) {
		throw new Error(
			'window.electron.ipcRenderer.invoke is not available. ' +
				'Ensure that ipcRenderer is properly exposed in your preload script.'
		);
	}
	return api;
}

/**
 * Creates a type-safe IPC client.
 *
 * @example
 * import type { AppApi } from './ipc.gen';
 * const api = createIpcClient<AppApi>();
 * const users = await api.users.getAll();
 */
export function createIpcClient<T extends Record<string, Record<string, unknown>>>(): T {
	const electron = getElectronApi();
	const cache = new Map<string, unknown>();

	return new Proxy({} as T, {
		get(_, namespace: string) {
			if (!cache.has(namespace)) {
				cache.set(
					namespace,
					new Proxy(
						{},
						{
							get(_, method: string) {
								return (...args: unknown[]) =>
									electron.ipcRenderer.invoke(`${namespace}:${method}`, ...args);
							},
						}
					)
				);
			}
			return cache.get(namespace);
		},
	});
}
