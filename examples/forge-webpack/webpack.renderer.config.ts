import type { Configuration } from 'webpack';

export const rendererConfig: Configuration = {
	module: {
		rules: [{ test: /\.ts$/, use: 'ts-loader', exclude: /node_modules/ }],
	},
	resolve: {
		extensions: ['.ts', '.js'],
	},
};
