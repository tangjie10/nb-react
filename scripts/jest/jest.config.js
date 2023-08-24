const { defaults } = require('jest-config');

module.exports = {
	...defaults,
	rootDir: process.cwd(),
	modulePathIgnorePatterns: [
		'<rootDir>/.history',
		'<rootDir>/node_modules/.pnpm'
	],
	moduleDirectories: [
		// 对于 React ReactDOM
		'dist/node_modules',
		// 对于第三方依赖
		...defaults.moduleDirectories
	],
	testEnvironment: 'jsdom'
};
