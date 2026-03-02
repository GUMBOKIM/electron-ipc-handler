/**
 * Global handler registry (singleton)
 *
 * TC39 decorators and ipcHandler() register here at import time,
 * then registerIpcDecoratorHandler() reads and connects them to ipcMain.handle.
 */
import type { ClassEntry, FnEntry } from './types';

/** Registered class handler entries */
export const classRegistry: ClassEntry[] = [];

/** Registered function handler entries */
export const fnRegistry: FnEntry[] = [];
