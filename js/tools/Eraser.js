"use strict";

module.exports = function (editor) {
    return {
        onDrag: function (x, y, pixel) {
            pixel.setColor(x, y, null);
            editor.repaint();
        }
    }
};
