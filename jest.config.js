export default {
    testEnvironment: 'node',
        moduleNameMapper: {
            '^(\\.{1,2}/.*)\\.js$': '$1',
        },
    testMatch: ['**/tests/**/*.test.js'],
    collectCoverageFrom: [
        'daten/**/*.js',
        'oberflaeche/**/*.js',
        'bearbeitungen/**/*.js',
        'menues/**/*.js',
        '!**/*.test.js',
        '!main.js'
    ],
    coveragePathIgnorePatterns: [
        '/node_modules/',
        '/tests/'
    ],
    coverageThreshold: {
        global: {
            branches: 50,
            functions: 50,
            lines: 50,
            statements: 50
        }
    },
    testTimeout: 10000
};
