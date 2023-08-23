import {
	getPackageJSON,
	resolvePackagePath,
	getBaseRollupPlugins
} from './utils';
import generatePackageJson from 'rollup-plugin-generate-package-json';
import alias from '@rollup/plugin-alias';
import { version } from 'typescript';

const { name, module } = getPackageJSON('react-dom');
//react 包的路径
const pkgPath = resolvePackagePath(name);
//react 产物路径
const pkgDistPath = resolvePackagePath(name, true);

export default [
	//react-dom
	{
		input: `${pkgPath}/${module}`,
		output: [
			{
				file: `${pkgDistPath}/index.js`,
				name: 'index.js',
				format: 'umd'
			},
			{
				file: `${pkgDistPath}/client.js`,
				name: 'client.js',
				format: 'umd'
			}
		],
		plugins: [
			...getBaseRollupPlugins(),
			// webpack resolve alias
			alias({
				entries: {
					hostConfig: `${pkgPath}/src/hostConfig.ts`
				}
			}),
			generatePackageJson({
				inputFolder: pkgPath,
				outputFolder: pkgDistPath,
				baseContents: (pkgJson) => {
					return {
						name: pkgJson.name,
						version: pkgJson.version,
						description: pkgJson.description,
						peerDependencies: {
							react: version
						},
						main: 'index.js'
					};
				}
			})
		]
	}
];
