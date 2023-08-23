import path from 'path';
import fs from 'fs';
import ts from 'rollup-plugin-typescript2';
import cjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
//打包入口路径
const pkgPath = path.resolve(__dirname, '../../packages');
//产物路径
const distPath = path.resolve(__dirname, '../../dist/node_modules');

export function resolvePackagePath(pkgName, isDist) {
	if (isDist) {
		return `${distPath}/${pkgName}`;
	}
	return `${pkgPath}/${pkgName}`;
}
export function getPackageJSON(pkgName) {
	//包路径
	const path = `${resolvePackagePath(pkgName)}/package.json`;
	const obj = JSON.parse(fs.readFileSync(path, 'utf-8'));
	return obj;
}

export function getBaseRollupPlugins({
	typescript = {},
	alias = {
		__DEV__: true
	}
} = {}) {
	return [replace(alias), cjs(), ts(typescript)];
}
