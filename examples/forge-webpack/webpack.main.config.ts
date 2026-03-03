import { electronIpcPlugin } from 'electron-ipc-handler/webpack';
import type { Configuration } from 'webpack';

export const mainConfig: Configuration = {
	entry: './src/main/main.ts',
	module: {
		rules: [{ test: /\.ts$/, use: 'ts-loader', exclude: /node_modules/ }],
	},
	resolve: {
		extensions: ['.ts', '.js'],
	},
	plugins: [
		electronIpcPlugin({
			dirs: ['src/main/ipc'],
			output: 'src/main/ipc/ipc.gen.ts',
			client: 'src/renderer/ipc/ipc.client.ts',
		}),
	],
};
