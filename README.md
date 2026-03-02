<p align="center">
  <h1 align="center">electron-ipc-handler</h1>
  <p align="center">
    Type-safe Electron IPC with TC39 decorators, auto code generation, and zero boilerplate.
  </p>
  <p align="center">
    <a href="https://www.npmjs.com/package/electron-ipc-handler"><img src="https://img.shields.io/npm/v/electron-ipc-handler.svg?style=flat-square" alt="npm version" /></a>
    <a href="https://github.com/GUMBOKIM/electron-ipc-handler/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/electron-ipc-handler.svg?style=flat-square" alt="license" /></a>
    <a href="https://www.npmjs.com/package/electron-ipc-handler"><img src="https://img.shields.io/npm/dm/electron-ipc-handler.svg?style=flat-square" alt="downloads" /></a>
  </p>
  <p align="center">
    <b>English</b> | <a href="./README.ko.md">한국어</a>
  </p>
</p>

<br />

```ts
// main process — define handlers
@ipcClass('users')
export class UserIpcHandler {
  @ipcMethod()
  getAll() { return db.users.findMany(); }
}

// renderer — call with full type safety
const users = await ipc.users.getAll();  // User[]
```

<br />

## Why?

| Problem | Solution |
|---------|----------|
| Channel names are **stringly-typed** — typos cause silent failures | Auto-generated `IpcApi` type from your handlers |
| No shared types between main and renderer | End-to-end type inference, zero manual sync |
| Bundler needs boilerplate for `electron` + Node.js externals | Plugins auto-configure everything |

<br />

## Features

| | |
|---|---|
| **Type-safe** | End-to-end types from main to renderer |
| **Auto codegen** | Scans handlers, emits `IpcApi` type on every build |
| **Two styles** | Class-based (`@ipcClass`) or function-based (`ipcHandler`) |
| **Interceptors** | Koa-style middleware for logging, auth, validation |
| **Context** | `getIpcContext()` anywhere via `AsyncLocalStorage` |
| **DI ready** | `resolver` option for tsyringe, inversify, or any container |
| **Bundler plugins** | Vite, webpack, Rollup, esbuild |
| **Zero config** | Auto-configures `electron` + Node.js built-in externals |

<br />

## Install

```bash
npm install electron-ipc-handler
```

> **Peer dependency:** `electron >= 13.0.0`

<br />

---

<br />

## Quick Start

### Project Structure

```
src/
├── main/
│   ├── main.ts
│   └── ipc/
│       ├── user.ipc.ts      ← class-based handler
│       ├── system.ipc.ts    ← function-based handler
│       └── ipc.gen.ts       ← auto-generated
├── preload/
│   └── preload.ts
└── renderer/
    └── ipc/
        └── ipc.client.ts    ← auto-generated
```

<br />

### Step 1 — Define handlers

<table>
<tr>
<th>Class-based</th>
<th>Function-based</th>
</tr>
<tr>
<td>

```ts
// user.ipc.ts
import { ipcClass, ipcMethod }
  from 'electron-ipc-handler';

@ipcClass('users')
export class UserIpcHandler {
  @ipcMethod()
  getAll() {
    return [{ id: 1, name: 'Alice' }];
  }

  @ipcMethod()
  getById(id: number) {
    return users.find(u => u.id === id);
  }
}
```

</td>
<td>

```ts
// system.ipc.ts
import { ipcHandler }
  from 'electron-ipc-handler';

export const ping = ipcHandler(
  'system:ping',
  (msg: string) => `pong: ${msg}`
);

export const version = ipcHandler(
  'system:version',
  () => '1.0.0'
);
```

</td>
</tr>
</table>

Both styles coexist in the same directory. The plugin detects them by decorator / function usage, not by file name.

<br />

### Step 2 — Configure your bundler

```ts
// vite.config.ts (main process)
import { electronIpcPlugin } from 'electron-ipc-handler/vite';

export default defineConfig({
  plugins: [
    electronIpcPlugin({
      dirs: ['src/main/ipc'],
      output: 'src/main/ipc/ipc.gen.ts',
      client: 'src/renderer/ipc/ipc.client.ts',
    }),
  ],
});
```

> Also available: [`/webpack`](#webpack) | [`/rollup`](#rollup) | [`/esbuild`](#esbuild) | [`/unplugin`](#advanced-unplugin)

<br />

### Step 3 — Register in main process

```ts
// main.ts
import { registerIpcDecoratorHandler } from './ipc/ipc.gen';

app.whenReady().then(() => {
  registerIpcDecoratorHandler();
  createWindow();
});
```

<br />

### Step 4 — Preload

```ts
// preload.ts
import { setupPreload } from 'electron-ipc-handler/preload';
setupPreload();
```

<br />

### Step 5 — Use in renderer

The plugin auto-generates `src/renderer/ipc/ipc.client.ts`:

```ts
// auto-generated — src/renderer/ipc/ipc.client.ts
import { createIpcClient } from 'electron-ipc-handler';
import type { IpcApi } from '../../main/ipc/ipc.gen';

export const ipc = createIpcClient<IpcApi>();
```

```ts
// anywhere in the renderer
import { ipc } from './ipc/ipc.client';

const users = await ipc.users.getAll();       // User[]
const pong  = await ipc.system.ping('hello'); // string
```

**That's it.** Full type safety, no channel strings in your app code.

<br />

---

<br />

## Bundler Plugins

Every plugin does two things:

1. **Codegen** — scans handler directories and generates the `IpcApi` type file
2. **Externals** — auto-configures `electron` and Node.js built-in externals

<br />

### Vite

```ts
import { electronIpcPlugin } from 'electron-ipc-handler/vite';

export default defineConfig({
  plugins: [
    electronIpcPlugin({
      dirs: ['src/main/ipc'],
      output: 'src/main/ipc/ipc.gen.ts',
    }),
  ],
});
```

### webpack

```ts
import { electronIpcPlugin } from 'electron-ipc-handler/webpack';

export default {
  plugins: [
    electronIpcPlugin({
      dirs: ['src/main/ipc'],
      output: 'src/main/ipc/ipc.gen.ts',
    }),
  ],
};
```

> **Note:** If you use `ts-loader`, set `"target": "ES2022"` in your `tsconfig.json`. With `"ESNext"`, TypeScript preserves TC39 decorator syntax (`@`) in the output, which webpack cannot parse.

### Rollup

```ts
import { electronIpcPlugin } from 'electron-ipc-handler/rollup';

export default {
  plugins: [
    ...electronIpcPlugin({
      dirs: ['src/main/ipc'],
      output: 'src/main/ipc/ipc.gen.ts',
    }),
  ],
};
```

### esbuild

```ts
import { electronIpcPlugin } from 'electron-ipc-handler/esbuild';

esbuild.build({
  plugins: [
    electronIpcPlugin({
      dirs: ['src/main/ipc'],
      output: 'src/main/ipc/ipc.gen.ts',
    }),
  ],
});
```

### Advanced (unplugin)

For custom setups, use the raw unplugin factory. This does **not** auto-configure externals.

```ts
import { ipcDecoratorPlugin } from 'electron-ipc-handler/unplugin';

const plugin = ipcDecoratorPlugin.vite({
  dirs: ['src/main/ipc'],
  output: 'src/main/ipc/ipc.gen.ts',
});
```

<br />

### Plugin Options

| Option   | Type       | Default | Description |
|----------|------------|---------|-------------|
| `dirs`   | `string[]` | —       | Directories to scan for handler files |
| `output` | `string`   | —       | Output path for the generated type file |
| `client` | `boolean \| string` | `true` | `true` = client next to gen file, `string` = custom output path, `false` = skip |

All paths are relative to the project root. Generated files (`*.gen.ts`, `ipc.client.ts`) are safe to place inside `dirs` — the plugin only picks up files containing `@ipcClass` or `ipcHandler` calls.

<br />

---

<br />

## API Reference

### Decorators

#### `@ipcClass(namespace)`

Registers all `@ipcMethod()` methods under the given namespace.

```ts
@ipcClass('users')
export class UserIpcHandler { ... }
// → channels: users:getAll, users:getById, ...
```

#### `@ipcMethod(channel?)`

Uses the method name as the channel if omitted.

```ts
@ipcMethod()           // channel = method name
getAll() { ... }

@ipcMethod('find')     // channel = 'find'
getById(id: number) { ... }
```

<br />

### Functions

#### `ipcHandler(channel, fn)`

Standalone function handler. Channel format: `namespace:method`.

```ts
export const ping = ipcHandler('system:ping', (msg: string) => `pong: ${msg}`);
```

#### `registerIpcDecoratorHandler(options?)`

Connects all handlers to `ipcMain.handle`. Call once after app is ready.

```ts
registerIpcDecoratorHandler();

// With options
registerIpcDecoratorHandler({
  resolver: (Target) => container.resolve(Target),
  interceptors: [loggingInterceptor],
});
```

| Option | Type | Description |
|--------|------|-------------|
| `resolver` | `(target: Constructor) => instance` | Class instance factory (DI) |
| `interceptors` | `IpcInterceptor[]` | Koa-style middleware array |

#### `getIpcContext()`

Returns the current IPC request context via `AsyncLocalStorage`. Works anywhere in the call chain.

```ts
const { channel, sender, args, event } = getIpcContext();
```

| Field | Type | Description |
|-------|------|-------------|
| `channel` | `string` | e.g., `'users:getAll'` |
| `args` | `unknown[]` | Invocation arguments |
| `sender` | `WebContents` | Requesting window |
| `event` | `IpcMainInvokeEvent` | Raw IPC event |

#### `createIpcClient<T>()`

Type-safe IPC client for the renderer.

```ts
const ipc = createIpcClient<IpcApi>();
// ipc.users.getAll() → ipcRenderer.invoke('users:getAll')
```

<br />

### Type Utilities

#### `InferApi<T>`

Extracts an API type map from handler classes:

```ts
type Api = InferApi<{ users: UserIpcHandler }>;
// → { users: { getAll(): Promise<User[]> } }
```

#### `ExtractIpcFn<T>`

Extracts the function signature from an `ipcHandler`:

```ts
type PingFn = ExtractIpcFn<typeof ping>;
// → (msg: string) => Promise<string>
```

<br />

---

<br />

## Interceptors

Koa-style middleware. Runs inside `AsyncLocalStorage` context.

```ts
import type { IpcInterceptor } from 'electron-ipc-handler';

const logger: IpcInterceptor = async (ctx, next) => {
  const start = Date.now();
  console.log(`→ ${ctx.channel}`, ctx.args);
  const result = await next();
  console.log(`← ${ctx.channel} ${Date.now() - start}ms`);
  return result;
};

const auth: IpcInterceptor = async (ctx, next) => {
  if (!isAuthorized(ctx.sender.id)) throw new Error('Unauthorized');
  return next();
};

registerIpcDecoratorHandler({
  interceptors: [logger, auth],
});
```

<br />

---

<br />

## Preload

One-liner setup:

```ts
import { setupPreload } from 'electron-ipc-handler/preload';
setupPreload();
```

Or manual setup if you need custom configuration:

```ts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    invoke: (channel: string, ...args: unknown[]) =>
      ipcRenderer.invoke(channel, ...args),
  },
});
```

<br />

---

<br />

## Examples

| Example | Bundler | Description |
|---------|---------|-------------|
| [`examples/vite`](./examples/vite) | Vite | Full working Electron app |
| [`examples/forge-vite`](./examples/forge-vite) | Electron Forge + Vite | Forge integration |
| [`examples/forge-webpack`](./examples/forge-webpack) | Electron Forge + webpack | Forge integration |

<br />

## License

MIT
