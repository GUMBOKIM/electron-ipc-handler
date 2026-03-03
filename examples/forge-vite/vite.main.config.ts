import { electronIpcPlugin } from 'electron-ipc-handler/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		electronIpcPlugin({
			dirs: ['src/main/ipc'],
			output: 'src/main/ipc/ipc.gen.ts',
			client: 'src/renderer/ipc/ipc.client.ts',
		}),
	],
});
