"use strict";

module.exports = function (editor) {
    return {
        onMouseDown: function (x, y, pixel) {
            this.onDrag(x, y, pixel);
        },

        onMouseUp: function (x, y, pixel) {

        },
        
        onClick: function (x, y, pixel) {
            this.onDrag(x, y, pixel);
        },

        onDrag: function (x, y, pixel) {
            pixel.setColor(x, y, null);
            editor.repaint();
        }
    }
};
