"use strict";

var Color = require("./Color.js");

module.exports = function (width, height) {
    var colors = {}, thumbNode;

    for (var x = 0; x < width; x++) {
        var data = {};

        for (var y = 0; y < height; y++) {
            data[y] = null;
        }

        colors[x] = data;
    }

    var exports = {
        getWidth: function () {
            return width;
        },

        getHeight: function () {
            return height;
        },

        setColor: function (x, y, color) {
            colors[x][y] = color;
        },

        getData: function () {
            return colors;
        },

        setThumbNode: function (node) {
            thumbNode = node;
            exports.render(document.createElement("canvas"), Math.ceil(32 / Math.max(width, height)));
        },

        render: function (canvas, size) {
            canvas.width = width * size;
            canvas.height = height * size;

            var ctx = canvas.getContext("2d");

            ctx.save();

            for (var x in colors) {
                if (!colors.hasOwnProperty(x)) {
                    continue;
                }

                for (var y in colors[x]) {
                    if (!colors[x].hasOwnProperty(y)) {
                        continue;
                    }

                    var color = colors[x][y] || new Color(0, 0, 0, 0);

                    if (color.getAlpha() > 0) {
                        ctx.fillStyle = color.toCSS();
                        ctx.fillRect(x * size, y * size, size, size);
                    }
                }
            }

            ctx.restore();

            thumbNode.style.backgroundImage = "url(" + canvas.toDataURL("image/png") + ")";
        }
    };

    return exports;
};
