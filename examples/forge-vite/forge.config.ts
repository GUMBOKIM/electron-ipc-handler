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
			renderer: [{ name: 'main_window', config: 'vite.renderer.config.ts' }],
		}),
	],
};

export default config;
