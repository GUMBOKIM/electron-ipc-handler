# Vite Example

A minimal Electron app using `electron-ipc-handler` with Vite.

## Setup

### 1. Install

```bash
npm install electron-ipc-handler
```

### 2. Vite configs

**Main process** (`vite.main.config.ts`):

```ts
import { electronIpcPlugin } from 'electron-ipc-handler/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: { entry: 'src/main/main.ts', formats: ['es'] },
    outDir: 'dist/main',
  },
  plugins: [
    electronIpcPlugin({
      dirs: ['src/main/ipc'],
      output: 'src/main/ipc/ipc.gen.ts',
      client: false,
    }),
  ],
});
```

**Preload** (`vite.preload.config.ts`):

```ts
export default defineConfig({
  build: {
    lib: { entry: 'src/preload/preload.ts', formats: ['cjs'] },
    outDir: 'dist/preload',
    rollupOptions: { external: ['electron'] },
  },
});
```

**Renderer** (`vite.renderer.config.ts`):

```ts
export default defineConfig({
  root: 'src/renderer',
  build: { outDir: '../../dist/renderer' },
});
```

### 3. Define handlers

```ts
// src/main/ipc/user.ipc.ts
import { ipcClass, ipcMethod } from 'electron-ipc-handler';

@ipcClass('users')
export class UserIpcHandler {
  @ipcMethod()
  getAll() { return [{ id: 1, name: 'Alice' }]; }
}
```

### 4. Register in main process

```ts
// src/main/main.ts
import { registerIpcDecoratorHandler } from './ipc/ipc.gen';

app.whenReady().then(() => {
  registerIpcDecoratorHandler();
  createWindow();
});
```

### 5. Preload

```ts
// src/preload/preload.ts
import { setupPreload } from 'electron-ipc-handler/preload';
setupPreload();
```

### 6. Renderer client

```ts
// src/renderer/src/ipc/client.ts
import { createIpcClient } from 'electron-ipc-handler';
import type { IpcApi } from '../../../main/ipc/ipc.gen';

export const ipc = createIpcClient<IpcApi>();
```

```ts
// src/renderer/src/renderer.ts
import { ipc } from './ipc/client';

const users = await ipc.users.getAll(); // fully typed
```

## Run

```bash
npm run build
npm start
```
