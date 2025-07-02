module.exports = {
	extends: ['oxlint:recommended', 'plugin:prettier/recommended'],
	rules: {
		'no-unused-vars': 'warn',
		'prefer-const': 'error',
		'no-var': 'error',
		'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
		'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
		'no-alert': 'warn',
		'no-undef': 'error',
		'no-unused-expressions': 'error',
		'no-prototype-builtins': 'warn',
		'no-constant-condition': 'warn',
		'no-async-promise-executor': 'warn',
		'no-useless-catch': 'warn',
		'no-unsafe-finally': 'warn',
		'no-unsafe-negation': 'warn',
		'no-unsafe-optional-chaining': 'warn',

		'@typescript-eslint/explicit-function-return-type': 'off', // NestJS usa tipado implícito en controladores/servicios
		'@typescript-eslint/no-explicit-any': 'warn',
		'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
		'@typescript-eslint/ban-types': 'warn',
		'@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
		'@typescript-eslint/member-ordering': 'warn',

		eqeqeq: ['error', 'always'],
		curly: ['error', 'all'],
		'consistent-return': 'error',
		'max-len': ['warn', { code: 100 }],
		camelcase: ['error', { properties: 'never' }],
	},
	ignorePatterns: ['dist/', 'node_modules/', 'test/', '*.js', '*.json'],
};
