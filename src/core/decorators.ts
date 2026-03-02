/**
 * TC39 standard decorators (Stage 3)
 *
 * - No experimentalDecorators needed
 * - No emitDecoratorMetadata needed
 * - Natively supported by esbuild, SWC, and tsc
 *
 * Passes metadata from method decorators to class decorators via Symbol.metadata.
 */

// Ensures decorator types are recognized even without "ESNext" in consumer's tsconfig lib.
/// <reference lib="esnext.decorators" />

import { classRegistry } from './registry';
import type { MethodMeta } from './types';

// Node < 22 polyfill — uses Object.defineProperty since it's a readonly property
if (!Symbol.metadata) {
	Object.defineProperty(Symbol, 'metadata', { value: Symbol('Symbol.metadata') });
}

/** Symbol key for storing method metadata */
const IPC_METHODS = Symbol('ipc-methods');

/**
 * Registers a class as an IPC handler.
 * Reads metadata recorded by method decorators in Symbol.metadata and registers them.
 *
 * @param namespace IPC channel prefix (e.g., 'users' → 'users:getAll')
 */
export function ipcClass(namespace: string) {
	// biome-ignore lint/suspicious/noExplicitAny: TC39 decorator signature
	return <T extends abstract new (...args: any[]) => any>(
		target: T,
		context: ClassDecoratorContext<T>
	): T => {
		const methods = (context.metadata[IPC_METHODS] ?? []) as MethodMeta[];
		// biome-ignore lint/suspicious/noExplicitAny: abstract → concrete casting
		classRegistry.push({ namespace, target: target as any, methods });
		return target;
	};
}

/**
 * Registers a method as an IPC handler.
 * Records method info in Symbol.metadata for the class decorator to collect.
 *
 * @param channel Sub-channel name. Uses method name if omitted.
 */
export function ipcMethod(channel?: string) {
	return <T>(_target: T, context: ClassMethodDecoratorContext): void => {
		if (!context.metadata[IPC_METHODS]) {
			context.metadata[IPC_METHODS] = [];
		}
		const methods = context.metadata[IPC_METHODS] as MethodMeta[];
		methods.push({
			channel: channel ?? String(context.name),
			propertyKey: String(context.name),
		});
	};
}
