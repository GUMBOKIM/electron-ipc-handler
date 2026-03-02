import { defineConfig } from 'tsup';

const decoratorRef = '/// <reference lib="esnext.decorators" />\n';

export default defineConfig({
	entry: {
		main: 'src/main.ts',
		renderer: 'src/renderer.ts',
		preload: 'src/preload.ts',
		unplugin: 'src/plugins/unplugin.ts',
		vite: 'src/plugins/vite.ts',
		webpack: 'src/plugins/webpack.ts',
		rollup: 'src/plugins/rollup.ts',
		esbuild: 'src/plugins/esbuild.ts',
	},
	format: ['esm', 'cjs'],
	dts: {
		banner: decoratorRef,
	},
	clean: true,
	external: ['electron'],
});
