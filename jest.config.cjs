module.exports = {
	moduleFileExtensions: ['js', 'json', 'ts'],
	rootDir: '.',
	testRegex: '.*\\.spec\\.ts$',
	transform: {
		'^.+\\.(t|j)s$': [
			'ts-jest',
			{
				tsconfig: 'tsconfig.json',
				isolatedModules: true,
			},
		],
	},
	collectCoverageFrom: ['src/**/*.(t|j)s'],
	coverageDirectory: './coverage',
	testEnvironment: 'node',
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/src/$1',
	},
	roots: ['<rootDir>/src/', '<rootDir>/test/'],
	moduleDirectories: ['node_modules', 'src'],
	testPathIgnorePatterns: ['/node_modules/', '/dist/', '/coverage/'],
	maxWorkers: 1, // Run tests in sequence to avoid database contamination
};
