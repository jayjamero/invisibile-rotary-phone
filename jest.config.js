module.exports = {
    preset: "ts-jest",
    testEnvironment: "./src/test-utils/fix-js-dom-environment.ts",
    transform: {
        "^.+\\.(js|jsx|ts|tsx)$": [
            "babel-jest",
            {
                presets: [
                    [
                        "next/babel",
                        {
                            /*
                             ** Runtime is being set to "classic", overriding the default
                             ** https://github.com/vercel/next.js/blob/canary/packages/next/src/build/babel/preset.ts#L86
                             */
                            "preset-react": { runtime: "automatic" },
                        },
                    ],
                ],
            },
        ],
    },
    testPathIgnorePatterns: ["/node_modules/", "/dist/"],
    moduleFileExtensions: ["js", "ts", "tsx"],
    setupFilesAfterEnv: ["./jest-setup.js"],
};
