module.exports = {
	root: true,
	env: {
		es2024: true,
		node: true,
		browser: true,
	},
	parser: "@typescript-eslint/parser",
	parserOptions: {
		ecmaVersion: "latest",
		sourceType: "module",
		project: "./tsconfig.eslint.json",
	},
	plugins: ["@typescript-eslint", "react", "react-hooks"],
	extends: [
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended",
		"plugin:react/recommended",
		"plugin:react-hooks/recommended",
	],
	settings: {
		react: {
			version: "detect",
		},
	},
	ignorePatterns: [
		"dist/",
		"build/",
		"node_modules/",
		".idx/",
		"client/public/",
		"showcase/",
	],
	rules: {
		"react/react-in-jsx-scope": "off",
		"react/prop-types": "off",
		"@typescript-eslint/no-unused-vars": [
			"warn",
			{
				argsIgnorePattern: "^_",
				varsIgnorePattern: "^_",
			},
		],
		"@typescript-eslint/explicit-function-return-type": "off",
		"@typescript-eslint/no-explicit-any": "off",
	},
};
