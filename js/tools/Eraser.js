"use strict";

module.exports = function (editor) {
    return {
        onClick: function (x, y, pixel) {
            this.onDrag(x, y, pixel);
        },

        onDrag: function (x, y, pixel) {
            pixel.setColor(x, y, null);
            editor.repaint();
        }
    }
};
