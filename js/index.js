HTMLCollection.prototype.forEach = Array.prototype.forEach;
NodeList.prototype.forEach = Array.prototype.forEach;

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
