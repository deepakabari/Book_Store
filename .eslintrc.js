module.exports = {
    env: {
        es2021: true,
        node: true,
    },
    extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"],
    overrides: [
        {
            env: {
                node: true,
            },
            files: [".eslintrc.{js,cjs}"],
            parserOptions: {
                sourceType: "script",
            },
        },
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
    },
    plugins: ["@typescript-eslint", "prettier"],
    rules: {
        indent: ["error", 4],
        "linebreak-style": ["error", "windows"],
        quotes: ["error", "double"],
        semi: ["error", "always"],
        "prettier/prettier": ["error"],
        "@typescript-eslint/no-explicit-any": "error",
        "@typescript-eslint/indent": ["error", 4],
        "no-console": true,
        "no-unused-vars": ["warn", { "argsIgnorePattern": "req|res|next|__" }],
        "no-invalid-this": "error",
        "no-return-assign": "error",
        "no-unused-expressions": ["error", { "allowTernary": true }],
        "no-useless-concat": "error",
        "no-useless-return": "error",
        "no-constant-condition": "warn",
        "no-mixed-spaces-and-tabs": "warn",
        "space-before-blocks": "error",
        "space-in-parens": "error",
        "space-infix-ops": "error",
        "space-unary-ops": "error",
        "no-confusing-arrow": "error",
        "no-duplicate-imports": "error",
        "no-var": "error",
        "object-shorthand": "off",
        "prefer-const": "error",
        "prefer-template": "warn"
    },
};
