"use strict";

module.exports = function (editor) {
    var start = null;

    return {
        onMouseDown: function (x, y, pixel) {
            start = {
                x: x,
                y: y
            };

            pixel.setSelectionPosition(start);
            pixel.setSelectionSize({x: 0, y: 0});
            editor.repaint();
        },

        onMouseUp: function (x, y, pixel) {
            if (!start) {
                pixel.setSelectionPosition({x: x, y: y});
                pixel.setSelectionSize({x: 0, y: 0});
                editor.repaint();
            }

            start = null;
        },

        onClick: function (x, y, pixel) {

        },

        onDrag: function (x, y, pixel) {
            if (!start) {
                return this.onMouseDown(x, y, pixel);
            }

            pixel.setSelectionSize({
                x: x - start.x,
                y: y - start.y
            });

            editor.repaint();
        }
    }
};
