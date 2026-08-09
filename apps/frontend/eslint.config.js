import antfu from "@antfu/eslint-config";

export default antfu({
	type: "app",
	react: true,
	typescript: true,
	formatters: false,
	stylistic: {
		indent: "tab",
		semi: true,
		quotes: "double"
	},
	ignores: ["dist", "node_modules", "package-lock.json", "src/routeTree.gen.ts", "playwright-report", "test-results", "blob-report"]
}, {
	rules: {
		// Allow to export not only component (shadcn Button & ButtonVariants)
		"react-refresh/only-export-components": "off",
		// Disallow trailing commas
		"style/comma-dangle": ["error", "never"],
		// Allow to use 'type' instead of 'interface' event if type is object
		"ts/consistent-type-definitions": "off",
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
		"node/no-process-env": ["error"],
		"perfectionist/sort-imports": ["error", {
			tsconfigRootDir: "."
		}],
		"unicorn/filename-case": ["error", {
			case: "kebabCase",
			ignore: ["README.md"]
		}]

	}
}, {
	files: ["vite.config.ts", "playwright.config.ts"],
	rules: {
		"node/no-process-env": "off"
	}
});
