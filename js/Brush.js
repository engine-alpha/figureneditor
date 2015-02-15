"use strict";

module.exports = function (editor) {
    return {
        onDrag: function (x, y, pixel) {
            var color = editor.getCurrentColor();
            pixel.setColor(x, y, color);
            editor.repaint();
        }
    }
};
