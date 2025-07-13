import JSDOMEnvironment from 'jest-environment-jsdom';

/**
 * Force Jest/jsdom to use Node.js structuredClone implementation
 * https://github.com/facebook/jest/blob/v29.4.3/website/versioned_docs/version-29.4/Configuration.md#testenvironment-string
 *
 * Custom Jest environment to polyfill `structuredClone` in JSDOM.
 * Fixes test failures for code using structuredClone in the global scope.
 */
export default class FixJSDOMEnvironment extends JSDOMEnvironment {
    constructor(...args: ConstructorParameters<typeof JSDOMEnvironment>) {
        super(...args);

        // FIXME https://github.com/jsdom/jsdom/issues/3363
        this.global.structuredClone = structuredClone;
    }
}
