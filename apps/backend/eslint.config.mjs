import antfu from "@antfu/eslint-config";

export default antfu({
	type: "app",
	node: true,
	typescript: true,
	formatters: false,
	stylistic: {
		indent: "tab",
		semi: true,
		quotes: "double",
	},
	ignores: ["dist", "node_modules", "package-lock.json"],
}, {
	rules: {
		// Dissalow sort keys
		"jsonc/sort-keys": "off",
		// Allow using an JSX expression per line ({' '}).
		"style/jsx-one-expression-per-line": "error",
		// Disallow using a top-level type-only import instead of inline type specifiers.
		"import/consistent-type-specifier-style": "off",
		// Disallow re-declaring variables, types, interfaces, etc. with the same name.
		"ts/no-redeclare": "error",
		// Disallow creating a top-level function only like function declaration.
		"antfu/top-level-function": "off",
		// Disallow using consoles.
		"no-console": "error",
		"antfu/no-top-level-await": ["off"],
		"node/prefer-global/process": ["off"],
		"node/no-process-env": ["off"],
		"perfectionist/sort-imports": ["error", {
			tsconfigRootDir: ".",
		}],
		"unicorn/filename-case": ["error", {
			case: "kebabCase",
			ignore: ["README.md"],
		}],

	},
});
