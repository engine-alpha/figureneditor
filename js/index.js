HTMLCollection.prototype.forEach = Array.prototype.forEach;
NodeList.prototype.forEach = Array.prototype.forEach;

// https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement.toBlob#Polyfill
if (!HTMLCanvasElement.prototype.toBlob) {
    Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
        value: function (callback, type, quality) {

            var binStr = atob(this.toDataURL(type, quality).split(',')[1]),
                len = binStr.length,
                arr = new Uint8Array(len);

            for (var i = 0; i < len; i++) {
                arr[i] = binStr.charCodeAt(i);
            }

            callback(new Blob([arr], {type: type || 'image/png'}));
        }
    });
}

var Editor = require("./Editor.js");
var main = document.getElementById("main");

window.ctrlDown = false;
window.keysDown = {};

document.addEventListener("keydown", function (e) {
    window.ctrlDown = e.ctrlKey;
    window.keysDown[e.which] = true;

    if (e.target.tagName === "INPUT") {
        e.preventDefault();
        return false;
    }
}, true);

document.addEventListener("keyup", function (e) {
    window.ctrlDown = e.ctrlKey;
    delete window.keysDown[e.which];
}, true);

new Editor;
