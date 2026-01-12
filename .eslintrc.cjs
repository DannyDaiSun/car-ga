module.exports = {
    env: {
        browser: true,
        es2022: true,
        node: true,
    },
    extends: ['eslint:recommended'],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
    rules: {
        'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
        'no-console': 'off',
        'semi': ['error', 'always'],
    },
    ignorePatterns: ['node_modules/', 'dist/', 'playwright-report/', 'test-results/'],
};
