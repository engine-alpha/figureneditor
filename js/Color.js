"use strict";

module.exports = function (red, green, blue, alpha) {
    alpha = typeof alpha === "undefined" ? 255 : alpha;

    return {
        getRed: function () {
            return red;
        },

        getGreen: function () {
            return green;
        },

        getBlue: function () {
            return blue;
        },

        getAlpha: function () {
            return alpha;
        },

        toCSS: function () {
            return "rgba(" + red + ", " + green + ", " + blue + ", " + (alpha / 255) + ")";
        },

        serialize: function () {
            return {
                r: red,
                g: green,
                b: blue,
                a: alpha
            };
        }
    }
};
