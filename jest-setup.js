require("@testing-library/jest-dom");
const React = require("react");

global.React = React;

global.matchMedia =
    global.matchMedia ||
    function () {
        return {
            matches: false,
            addListener: function () {},
            removeListener: function () {},
        };
    };
