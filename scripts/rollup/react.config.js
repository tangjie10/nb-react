import {
	getPackageJSON,
	resolvePackagePath,
	getBaseRollupPlugins
} from './utils';
import generatePackageJson from 'rollup-plugin-generate-package-json';

const { name, module } = getPackageJSON('react');
//react 包的路径
const pkgPath = resolvePackagePath(name);
//react 产物路径
const pkgDistPath = resolvePackagePath(name, true);

export default [
	//react
	{
		input: `${pkgPath}/${module}`,
		output: {
			file: `${pkgDistPath}/index.js`,
			name: 'index.js',
			format: 'umd'
		},
		plugins: [
			...getBaseRollupPlugins(),
			generatePackageJson({
				inputFolder: pkgPath,
				outputFolder: pkgDistPath,
				baseContents: (pkgJson) => {
					return {
						name: pkgJson.name,
						version: pkgJson.version,
						description: pkgJson.description,
						main: 'index.js'
					};
				}
			})
		]
	},
	//jsx-runtime
	{
		input: `${pkgPath}/src/jsx.ts`,
		output: [
			{
				file: `${pkgDistPath}/jsx-runtime.js`,
				name: 'jsx-runtime.js',
				format: 'umd'
			},
			{
				file: `${pkgDistPath}/jsx-dev-runtime.js`,
				name: 'jsx-dev-runtime.js',
				format: 'umd'
			}
		],
		plugins: getBaseRollupPlugins()
	}
];
