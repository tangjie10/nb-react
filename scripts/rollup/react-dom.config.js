import {
	getPackageJSON,
	resolvePackagePath,
	getBaseRollupPlugins
} from './utils';
import generatePackageJson from 'rollup-plugin-generate-package-json';
import alias from '@rollup/plugin-alias';
import { version } from 'typescript';

const { name, module, peerDependencies } = getPackageJSON('react-dom');
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
				name: 'ReactDOM',
				format: 'umd'
			},
			{
				file: `${pkgDistPath}/client.js`,
				name: 'client',
				format: 'umd'
			}
		],
		external: [...Object.keys(peerDependencies)],
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
	},
	// react-test-utils
	{
		input: `${pkgPath}/test-utils.ts`,
		output: {
			file: `${pkgDistPath}/test-utils.ts`,
			name: 'testUtils',
			format: 'umd'
		},
		external: ['react', 'react-dom'],
		plugins: getBaseRollupPlugins()
	}
];
