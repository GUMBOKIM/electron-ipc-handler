import { builtinModules } from 'node:module';

/** Electron + Node.js built-in modules — common externals for main-process bundling */
export const electronExternals: string[] = [
	'electron',
	...builtinModules,
	...builtinModules.map((m) => `node:${m}`),
];
