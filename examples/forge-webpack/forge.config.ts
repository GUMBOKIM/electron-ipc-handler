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
