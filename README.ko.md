<p align="center">
  <h1 align="center">electron-ipc-handler</h1>
  <p align="center">
    TC39 데코레이터 기반의 타입 안전한 Electron IPC. 자동 코드 생성, 보일러플레이트 제로.
  </p>
  <p align="center">
    <a href="https://www.npmjs.com/package/electron-ipc-handler"><img src="https://img.shields.io/npm/v/electron-ipc-handler.svg?style=flat-square" alt="npm version" /></a>
    <a href="https://github.com/GUMBOKIM/electron-ipc-handler/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/electron-ipc-handler.svg?style=flat-square" alt="license" /></a>
    <a href="https://www.npmjs.com/package/electron-ipc-handler"><img src="https://img.shields.io/npm/dm/electron-ipc-handler.svg?style=flat-square" alt="downloads" /></a>
  </p>
  <p align="center">
    <a href="./README.md">English</a> | <b>한국어</b>
  </p>
</p>

<br />

```ts
// 메인 프로세스 — 핸들러 정의
@ipcClass('users')
export class UserIpcHandler {
  @ipcMethod()
  getAll() { return db.users.findMany(); }
}

// 렌더러 — 완전한 타입 안전성으로 호출
const users = await ipc.users.getAll();  // User[]
```

<br />

## 왜 필요한가?

| 문제 | 해결 |
|------|------|
| 채널명이 **문자열 기반** — 오타가 나도 조용히 실패 | 핸들러에서 `IpcApi` 타입을 자동 생성 |
| 메인과 렌더러 간 공유 타입 없음 | 엔드투엔드 타입 추론, 수동 동기화 불필요 |
| 번들러에 `electron` + Node.js externals 설정 필요 | 플러그인이 자동으로 설정 |

<br />

## 기능

| | |
|---|---|
| **타입 안전** | 메인에서 렌더러까지 엔드투엔드 타입 |
| **자동 코드 생성** | 핸들러를 스캔하여 매 빌드마다 `IpcApi` 타입 생성 |
| **두 가지 스타일** | 클래스 기반 (`@ipcClass`) 또는 함수 기반 (`ipcHandler`) |
| **인터셉터** | Koa 스타일 미들웨어 (로깅, 인증, 검증) |
| **컨텍스트** | `AsyncLocalStorage` 기반 `getIpcContext()` |
| **DI 지원** | tsyringe, inversify 등을 위한 `resolver` 옵션 |
| **번들러 플러그인** | Vite, webpack, Rollup, esbuild |
| **제로 설정** | `electron` + Node.js 빌트인 externals 자동 설정 |

<br />

## 설치

```bash
npm install electron-ipc-handler
```

> **Peer dependency:** `electron >= 13.0.0`

<br />

---

<br />

## 빠른 시작

### 프로젝트 구조

```
src/
├── main/
│   ├── main.ts
│   └── ipc/
│       ├── user.ipc.ts      ← 클래스 기반 핸들러
│       ├── system.ipc.ts    ← 함수 기반 핸들러
│       └── ipc.gen.ts       ← 자동 생성
├── preload/
│   └── preload.ts
└── renderer/
    └── ipc/
        └── ipc.client.ts    ← 자동 생성
```

<br />

### 1단계 — 핸들러 정의

<table>
<tr>
<th>클래스 기반</th>
<th>함수 기반</th>
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

두 스타일은 같은 디렉토리에 공존할 수 있습니다. 플러그인은 데코레이터/함수 사용 여부로 감지합니다.

<br />

### 2단계 — 번들러 설정

```ts
// vite.config.ts (메인 프로세스)
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

> 다른 번들러: [`/webpack`](#webpack) | [`/rollup`](#rollup) | [`/esbuild`](#esbuild) | [`/unplugin`](#고급-unplugin)

<br />

### 3단계 — 메인 프로세스에서 등록

```ts
// main.ts
import { registerIpcDecoratorHandler } from './ipc/ipc.gen';

app.whenReady().then(() => {
  registerIpcDecoratorHandler();
  createWindow();
});
```

<br />

### 4단계 — 프리로드

```ts
// preload.ts
import { setupPreload } from 'electron-ipc-handler/preload';
setupPreload();
```

<br />

### 5단계 — 렌더러에서 사용

플러그인이 `src/renderer/ipc/ipc.client.ts`를 자동 생성합니다:

```ts
// 자동 생성됨 — src/renderer/ipc/ipc.client.ts
import { createIpcClient } from 'electron-ipc-handler';
import type { IpcApi } from '../../main/ipc/ipc.gen';

export const ipc = createIpcClient<IpcApi>();
```

```ts
// 렌더러 어디서든
import { ipc } from './ipc/ipc.client';

const users = await ipc.users.getAll();       // User[]
const pong  = await ipc.system.ping('hello'); // string
```

**끝.** 완전한 타입 안전성, 앱 코드에 채널 문자열 없음.

<br />

---

<br />

## 번들러 플러그인

모든 플러그인은 두 가지를 수행합니다:

1. **코드 생성** — 핸들러 디렉토리를 스캔하여 `IpcApi` 타입 파일 생성
2. **Externals** — `electron`과 Node.js 빌트인 externals 자동 설정

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

> **주의:** `ts-loader` 사용 시 `tsconfig.json`에서 `"target": "ES2022"`로 설정하세요. `"ESNext"`로 설정하면 TypeScript가 TC39 데코레이터 구문(`@`)을 그대로 출력하여 webpack이 파싱할 수 없습니다.

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

### 고급 (unplugin)

커스텀 설정을 위한 raw unplugin factory. externals 자동 설정은 **포함되지 않습니다.**

```ts
import { ipcDecoratorPlugin } from 'electron-ipc-handler/unplugin';

const plugin = ipcDecoratorPlugin.vite({
  dirs: ['src/main/ipc'],
  output: 'src/main/ipc/ipc.gen.ts',
});
```

<br />

### 플러그인 옵션

| 옵션 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `dirs` | `string[]` | — | 핸들러 파일을 스캔할 디렉토리 |
| `output` | `string` | — | 생성할 타입 파일 경로 |
| `client` | `boolean \| string` | `true` | `true` = gen 파일 옆에 생성, `string` = 커스텀 경로, `false` = 생성 안 함 |

모든 경로는 프로젝트 루트 기준 상대 경로입니다. 생성된 파일(`*.gen.ts`, `ipc.client.ts`)은 `dirs` 안에 놓아도 안전합니다 — 플러그인은 `@ipcClass` 또는 `ipcHandler` 호출이 포함된 파일만 감지합니다.

<br />

---

<br />

## API 레퍼런스

### 데코레이터

#### `@ipcClass(namespace)`

주어진 네임스페이스 아래에 모든 `@ipcMethod()` 메서드를 등록합니다.

```ts
@ipcClass('users')
export class UserIpcHandler { ... }
// → 채널: users:getAll, users:getById, ...
```

#### `@ipcMethod(channel?)`

생략하면 메서드 이름을 채널로 사용합니다.

```ts
@ipcMethod()           // 채널 = 메서드 이름
getAll() { ... }

@ipcMethod('find')     // 채널 = 'find'
getById(id: number) { ... }
```

<br />

### 함수

#### `ipcHandler(channel, fn)`

독립형 함수 핸들러. 채널 형식: `namespace:method`.

```ts
export const ping = ipcHandler('system:ping', (msg: string) => `pong: ${msg}`);
```

#### `registerIpcDecoratorHandler(options?)`

모든 핸들러를 `ipcMain.handle`에 연결합니다. 앱 준비 후 한 번 호출하세요.

```ts
registerIpcDecoratorHandler();

// 옵션 사용
registerIpcDecoratorHandler({
  resolver: (Target) => container.resolve(Target),
  interceptors: [loggingInterceptor],
});
```

| 옵션 | 타입 | 설명 |
|------|------|------|
| `resolver` | `(target: Constructor) => instance` | 클래스 인스턴스 팩토리 (DI) |
| `interceptors` | `IpcInterceptor[]` | Koa 스타일 미들웨어 배열 |

#### `getIpcContext()`

`AsyncLocalStorage`를 통해 현재 IPC 요청 컨텍스트를 반환합니다. 호출 체인 어디서든 사용 가능합니다.

```ts
const { channel, sender, args, event } = getIpcContext();
```

| 필드 | 타입 | 설명 |
|------|------|------|
| `channel` | `string` | 예: `'users:getAll'` |
| `args` | `unknown[]` | 호출 인자 |
| `sender` | `WebContents` | 요청한 윈도우 |
| `event` | `IpcMainInvokeEvent` | 원시 IPC 이벤트 |

#### `createIpcClient<T>()`

렌더러용 타입 안전 IPC 클라이언트.

```ts
const ipc = createIpcClient<IpcApi>();
// ipc.users.getAll() → ipcRenderer.invoke('users:getAll')
```

<br />

### 타입 유틸리티

#### `InferApi<T>`

핸들러 클래스에서 API 타입 맵을 추출합니다:

```ts
type Api = InferApi<{ users: UserIpcHandler }>;
// → { users: { getAll(): Promise<User[]> } }
```

#### `ExtractIpcFn<T>`

`ipcHandler`에서 함수 시그니처를 추출합니다:

```ts
type PingFn = ExtractIpcFn<typeof ping>;
// → (msg: string) => Promise<string>
```

<br />

---

<br />

## 인터셉터

Koa 스타일 미들웨어. `AsyncLocalStorage` 컨텍스트 내에서 실행됩니다.

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

## 프리로드

한 줄로 설정:

```ts
import { setupPreload } from 'electron-ipc-handler/preload';
setupPreload();
```

커스텀 설정이 필요한 경우 수동 설정:

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

## 예제

| 예제 | 번들러 | 설명 |
|------|--------|------|
| [`examples/vite`](./examples/vite) | Vite | 완전한 Electron 앱 |
| [`examples/forge-vite`](./examples/forge-vite) | Electron Forge + Vite | Forge 통합 |
| [`examples/forge-webpack`](./examples/forge-webpack) | Electron Forge + webpack | Forge 통합 |

<br />

## 라이선스

MIT
