HTMLCollection.prototype.forEach = Array.prototype.forEach;
NodeList.prototype.forEach = Array.prototype.forEach;

var Editor = require("./Editor.js");
var main = document.getElementById("main");

window.ctrlDown = false;

document.addEventListener("keydown", function (e) {
    window.ctrlDown = e.ctrlKey;
});

document.addEventListener("keyup", function (e) {
    window.ctrlDown = e.ctrlKey;
});

new Editor;


/* var onMouseWheel = function (e) {
 if (ctrlDown) {
 e.preventDefault();
 editorPane.zoom(e.wheelDelta / 5);
 }
 }; */

// IE9, Chrome, Safari, Opera
// document.addEventListener("mousewheel", onMouseWheel, false);
// Firefox
// document.addEventListener("DOMMouseScroll", onMouseWheel, false);
