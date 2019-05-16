module.exports = {
    "env": {
        "browser": true,
        "es6": true,
        "node": true
    },
    "parser": "babel-eslint",
    "extends": "eslint:recommended",
    "parserOptions": {
        "sourceType": "module"
    },
    "rules": {
        'no-console': 'off',
        'no-unused-vars': 'off',
        "indent": [
            "error",
            4
        ],
        "linebreak-style": 'off',
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ]
    }
};