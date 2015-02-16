"use strict";

module.exports = function (editor) {
    return {
        onClick: function (x, y, pixel) {
            this.onDrag(x, y, pixel);
        },

        onDrag: function (x, y, pixel) {
            var color = editor.getCurrentColor();
            pixel.setColor(x, y, color);
            editor.repaint();
        }
    }
};
