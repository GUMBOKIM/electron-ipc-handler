import { defineConfig } from 'vite';

export default defineConfig({
	build: {
		lib: { entry: 'src/preload/preload.ts', formats: ['cjs'] },
		outDir: 'dist/preload',
		rollupOptions: { external: ['electron'] },
		minify: false,
	},
});
