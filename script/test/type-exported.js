
/* eslint-disable unicorn/prefer-module */
const fs = require('node:fs');
const path = require('node:path');
const process = require('node:process');

/**
 * @typedef {Object} ModuleInfo
 * @property {Map<string, Set<string>>} imports - A record mapping module names to their imported dependencies.
 * @property {Set<string>} exports - An array of exported module names.
 */

/**
 * @param {string} file
 * @param {string} currentPath
 * @param {ModuleInfo}
 */

const parseFile = file => {
	/** @type {ModuleInfo} */
	const out = {
		imports: new Map(),
		exports: new Set(),
	};

	let fileText = fs.readFileSync(file, 'utf8');
	fileText = fileText.replaceAll(/\/\*[\s\S]*?\*\/|\/\/.*/g, ''); // Remove comments

	// Parse imports
	const importMatch = fileText.matchAll(
		// eslint-disable-next-line unicorn/better-regex
		/[export|import]\s*[type]*\s*{([(\s\w,)]*)}\s*from\s*['|"]([.\\].*?)['|"]/g,
	);
	for (const matchResult of importMatch) {
		const [_, typeNames, filePath] = matchResult;
		const types = typeNames
			.split(',')
			.map(type => type.replace('type ', '').trim())
			.filter(Boolean);

		const _absoluteFilePath = path.resolve(path.dirname(file), filePath);
		let absoluteFilePath = _absoluteFilePath;

		if (fs.existsSync(`${_absoluteFilePath}/index.ts`)) {
			absoluteFilePath = `${_absoluteFilePath}/index.ts`;
		}

		if (fs.existsSync(`${_absoluteFilePath}/index.d.ts`)) {
			absoluteFilePath = `${_absoluteFilePath}/index.d.ts`;
		}

		if (!fs.existsSync(absoluteFilePath)) {
			absoluteFilePath = `${_absoluteFilePath}.d.ts`;
		}

		if (!fs.existsSync(absoluteFilePath)) {
			absoluteFilePath = `${_absoluteFilePath}.ts`;
		}

		if (!fs.existsSync(absoluteFilePath)) {
			throw new Error(`Cannot find module file for "${filePath}"`);
		}

		if (!out.imports.has(absoluteFilePath)) {
			out.imports.set(absoluteFilePath, new Set());
		}

		for (const type of types) {
			out.imports.get(absoluteFilePath).add(type);
		}
	}

	// Parse exports
	// e.g. `export { type A }`
	const exportMatch1 = fileText.matchAll(/export\s*[type]*\s*{([(\s\w,)]*)}/g);
	for (const matchResult of exportMatch1) {
		const [_, typeNames] = matchResult;
		const types = typeNames
			.split(',')
			.map(type => type.replace('type ', '').trim())
			.filter(Boolean);

		for (const type of types) {
			out.exports.add(type);
		}
	}

	// E.g. `export type A = 1`
	const exportMatch2 = fileText.matchAll(/export\stype\s(\w+)/g);
	for (const matchResult of exportMatch2) {
		const [_, typeName] = matchResult;
		out.exports.add(typeName);
	}

	return out;
};

/**
 * @param {string} entryFile
 * @returns {Map<string, ModuleInfo>}
 */
const parseProject = entryFile => {
	/** @type {Map<string, ModuleInfo>} */
	const project = new Map();

	const stack = [entryFile];
	while (stack.length > 0) {
		const file = stack.pop();
		const fileInfo = parseFile(file);
		project.set(file, fileInfo);
		for (const [importPath] of fileInfo.imports) {
			if (!project.has(importPath)) {
				stack.push(importPath);
			}
		}
	}

	return project;
};

/**
 * @param {string} entryFile
 */
const checkTypeExported = entryFile => {
	const errors = [];

	const project = parseProject(entryFile);

	for (const [file, moduleInfo] of project) {
		for (const importedModule of moduleInfo.imports.keys()) {
			const importedVariable = moduleInfo.imports.get(importedModule);
			if (!importedVariable) {
				continue;
			}

			const exportedVariable = project.get(importedModule).exports;

			for (const variable of importedVariable) {
				if (!exportedVariable.has(variable)) {
					const error = `❌ Variable "${variable}" is not exported in "${importedModule}" but imported in "${file}".\n`;
					console.error(error);
					errors.push({missingExportedVariable: variable});
				}
			}
		}
	}

	if (errors.length > 0) {
		process.exitCode = 1;
	}

	return errors;
};

checkTypeExported(path.resolve(process.cwd(), 'index.d.ts'));

// Expect error
const checkTypeExportedError = () => {
	const errors = checkTypeExported(path.resolve(process.cwd(), './test-d/type-exported/index.d.ts'), true);
	console.log(errors);
};

checkTypeExportedError();

