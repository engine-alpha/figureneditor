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
            if (x in colors && y in colors[x]) {
                colors[x][y] = color;
            } else {
                console.info(x + ", " + y + " " + colors);
            }
        },

        getData: function () {
            return colors;
        },

        setThumbNode: function (node) {
            thumbNode = node;
            exports.render(document.createElement("canvas"), Math.ceil(32 / Math.max(width, height)));
        },

        render: function (canvas, drawSize, drawGrid) {
            drawGrid = drawGrid || false;
            var size = {
                x: width,
                y: height
            };

            canvas.width = width * drawSize;
            canvas.height = height * drawSize;

            var ctx = canvas.getContext("2d");

            ctx.save();

            var x, y;

            for (x in colors) {
                if (!colors.hasOwnProperty(x)) {
                    continue;
                }

                for (y in colors[x]) {
                    if (!colors[x].hasOwnProperty(y)) {
                        continue;
                    }

                    var color = colors[x][y] || new Color(0, 0, 0, 0);

                    if (color.getAlpha() > 0) {
                        ctx.fillStyle = color.toCSS();
                        ctx.fillRect(x * drawSize, y * drawSize, drawSize, drawSize);
                    }
                }
            }

            if (drawGrid) {
                ctx.strokeStyle = "rgba(0,0,0,.2)";

                for (x = 0; x < size.x + 1; x++) {
                    ctx.beginPath();
                    ctx.moveTo(x * drawSize - .5, -.5);
                    ctx.lineTo(x * drawSize - .5, size.y * drawSize - .5);
                    ctx.moveTo(x * drawSize + .5, +.5);
                    ctx.lineTo(x * drawSize + .5, size.y * drawSize + .5);
                    ctx.stroke();
                }

                for (y = 0; y < size.y + 1; y++) {
                    ctx.beginPath();
                    ctx.moveTo(-.5, y * drawSize - .5);
                    ctx.lineTo(size.x * drawSize - .5, y * drawSize - .5);
                    ctx.moveTo(+.5, y * drawSize + .5);
                    ctx.lineTo(size.x * drawSize + .5, y * drawSize + .5);
                    ctx.stroke();
                }
            }

            ctx.restore();

            thumbNode.style.backgroundImage = "url(" + canvas.toDataURL("image/png") + ")";
        }
    };

    return exports;
};
