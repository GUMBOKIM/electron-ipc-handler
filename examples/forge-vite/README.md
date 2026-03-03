# Electron Forge + Vite Example

Full working example using `electron-ipc-handler/vite` with `@electron-forge/plugin-vite`.

## Setup

### 1. Install

```bash
npm install electron-ipc-handler
npm install -D @electron-forge/cli @electron-forge/maker-zip @electron-forge/plugin-vite electron typescript
```

### 2. Forge config

```ts
// forge.config.ts
import { MakerZIP } from '@electron-forge/maker-zip';
import { VitePlugin } from '@electron-forge/plugin-vite';
import type { ForgeConfig } from '@electron-forge/shared-types';

const config: ForgeConfig = {
  packagerConfig: {},
  makers: [new MakerZIP({})],
  plugins: [
    new VitePlugin({
      build: [
        { entry: 'src/main/main.ts', config: 'vite.main.config.ts' },
        { entry: 'src/preload/preload.ts', config: 'vite.preload.config.ts' },
      ],
      renderer: [
        { name: 'main_window', config: 'vite.renderer.config.ts' },
      ],
    }),
  ],
};

export default config;
```

### 3. Main process Vite config

```ts
// vite.main.config.ts
import { electronIpcPlugin } from 'electron-ipc-handler/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    electronIpcPlugin({
      dirs: ['src/main/ipc'],
      output: 'src/main/ipc/ipc.gen.ts',
      client: false,
    }),
  ],
});
```

### 4. Preload & Renderer Vite configs

```ts
// vite.preload.config.ts
import { defineConfig } from 'vite';
export default defineConfig({});

// vite.renderer.config.ts
import { defineConfig } from 'vite';
export default defineConfig({
  root: 'src/renderer',
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
// src/renderer/renderer.ts (or a separate client file)
import { createIpcClient } from 'electron-ipc-handler';
import type { IpcApi } from '../main/ipc/ipc.gen';

const ipc = createIpcClient<IpcApi>();

// Use with full type safety
const users = await ipc.users.getAll();
```

## Run

```bash
npm start       # electron-forge start
npm run build   # electron-forge make
```
