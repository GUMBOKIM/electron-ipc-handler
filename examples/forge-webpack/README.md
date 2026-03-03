# Electron Forge + Webpack Example

Full working example using `electron-ipc-handler/webpack` with `@electron-forge/plugin-webpack`.

## Setup

### 1. Install

```bash
npm install electron-ipc-handler
npm install -D @electron-forge/cli @electron-forge/maker-zip @electron-forge/plugin-webpack electron ts-loader typescript
```

### 2. tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

> **Important:** Use `"target": "ES2022"`, not `"ESNext"`. With `"ESNext"`, TypeScript preserves TC39 decorator syntax (`@`) in the output, which webpack cannot parse.

### 3. Main process webpack config

```ts
// webpack.main.config.ts
import { electronIpcPlugin } from 'electron-ipc-handler/webpack';
import type { Configuration } from 'webpack';

export const mainConfig: Configuration = {
  entry: './src/main/main.ts',
  module: {
    rules: [
      { test: /\.ts$/, use: 'ts-loader', exclude: /node_modules/ },
    ],
  },
  resolve: { extensions: ['.ts', '.js'] },
  plugins: [
    electronIpcPlugin({
      dirs: ['src/main/ipc'],
      output: 'src/main/ipc/ipc.gen.ts',
      client: false,
    }),
  ],
};
```

The plugin auto-configures `electron` and Node.js built-in externals + runs IPC codegen.

### 4. Renderer webpack config

```ts
// webpack.renderer.config.ts
import type { Configuration } from 'webpack';

export const rendererConfig: Configuration = {
  module: {
    rules: [
      { test: /\.ts$/, use: 'ts-loader', exclude: /node_modules/ },
    ],
  },
  resolve: { extensions: ['.ts', '.js'] },
};
```

### 5. Forge config

```ts
// forge.config.ts
import { MakerZIP } from '@electron-forge/maker-zip';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';
import type { ForgeConfig } from '@electron-forge/shared-types';
import { mainConfig } from './webpack.main.config';
import { rendererConfig } from './webpack.renderer.config';

const config: ForgeConfig = {
  packagerConfig: {},
  makers: [new MakerZIP({})],
  plugins: [
    new WebpackPlugin({
      mainConfig,
      renderer: {
        config: rendererConfig,
        entryPoints: [
          {
            html: './src/renderer/index.html',
            js: './src/renderer/renderer.ts',
            name: 'main_window',
            preload: { js: './src/preload/preload.ts' },
          },
        ],
      },
    }),
  ],
};

export default config;
```

### 6. Preload

```ts
// src/preload/preload.ts
import { setupPreload } from 'electron-ipc-handler/preload';
setupPreload();
```

### 7. Renderer client

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
