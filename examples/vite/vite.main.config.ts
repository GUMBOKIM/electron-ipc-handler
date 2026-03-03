import { electronIpcPlugin } from 'electron-ipc-handler/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	build: {
		lib: { entry: 'src/main/main.ts', formats: ['es'] },
		outDir: 'dist/main',
		minify: false,
	},
	plugins: [
		electronIpcPlugin({
			dirs: ['src/main/ipc'],
			output: 'src/main/ipc/ipc.gen.ts',
			client: 'src/renderer/src/ipc/ipc.client.ts',
		}),
	],
});
