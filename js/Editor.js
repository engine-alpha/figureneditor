"use strict";

var Brush = require("./tools/Brush.js");
var Eraser = require("./tools/Eraser.js");
var Color = require("./Color.js");
var Colors = require("./Colors.js");
var PixelField = require("./PixelField.js");
var Util = require("./Util.js");
var saveAs = require("filesaver.js");

var template = {
    tab: require("../html/tab.handlebars"),
    main: require("../html/editor.handlebars"),
    empty: require("../html/empty.handlebars")
};

module.exports = function () {
    var loaded = false, saved = true, current = 0, animation = [], panels = {}, size = {}, canvas, previewCanvas,
        currentFrame = 0, currentFrameStart = 0, frameTime = 75, translate = {x: 0, y: 0}, scale = 100, currentTool;

    var exports = {};

    var tools = {
        brush: new Brush(exports),
        eraser: new Eraser(exports)
    };

    currentTool = tools.brush;

    var main = document.getElementById("main");

    var actions = {
        new: document.getElementById("action.new"),
        open: document.getElementById("action.open"),
        save: document.getElementById("action.save"),
        close: document.getElementById("action.close")
    };

    var onFileInputChange = function (e) {
        var files = e.target.files;
        var onload = function (file) {
            if (close()) {
                return;
            }

            load(files[0].name, file.target.result.toString());
        };

        if (files.length === 1) {
            var reader = new FileReader();
            reader.onload = onload;
            reader.readAsText(files[0]);
        }

        var node = input.cloneNode(true);
        input.parentNode.replaceChild(node, input);
        input = node;
        input.addEventListener("change", onFileInputChange);
    };

    var input = document.getElementById("fileinput");
    input.addEventListener("change", onFileInputChange);

    actions.new.addEventListener("click", function () {
        if (close()) {
            return;
        }

        create();
    });

    actions.save.addEventListener("click", function () {
        save();
    });

    actions.close.addEventListener("click", function () {
        close();
    });

    var create = function () {
        var width, height;

        while (isNaN(width = prompt("Breite der Figur", "20"))) {
            alert("Das ist keine gültige Zahl");
        }

        while (isNaN(height = prompt("Breite der Figur", "20"))) {
            alert("Das ist keine gültige Zahl");
        }

        width = parseInt(Math.round(width));
        height = parseInt(Math.round(height));

        // fake figure so we don't have to duplicate any logic
        var fakeLines = [
            "_fig_",
            "an:0",
            "f:1",
            "x:" + width,
            "y:" + height,
            "p:0",
            "q:0"
        ];

        load("unbekannt.eaf", fakeLines.join("\n"));
    };

    var load = function (name, data) {
        reset();

        loaded = true;
        actions.save.classList.remove("nodisplay");
        actions.close.classList.remove("nodisplay");
        document.body.classList.remove("body-intro");
        document.getElementById("filename").textContent = name;
        main.innerHTML = template.main();
        canvas = document.getElementById("editorpane").querySelector("canvas");
        previewCanvas = document.getElementById("preview").querySelector("canvas");
        panels.tabs = main.querySelector("#tabs");
        actions.insert = document.getElementById("action.insert");
        actions.insert.addEventListener("click", function () {
            var pixel = new PixelField(size.x, size.y);

            animation.push(pixel);
            addPixelField(pixel, true);
            saved = false;
            repaint();
        });

        data = data.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
        var lines = data.split("\n");
        var line = lines[0];
        var currentLine = 0;

        if (line !== "_fig_") {
            alert("Fehler beim Laden der Datei!");
            reset();
            return;
        }

        line = lines[++currentLine];
        var animationLength = parseInt(line.substring(3));

        line = lines[++currentLine];
        var factor = parseInt(line.substring(2));

        line = lines[++currentLine];
        var x = parseInt(line.substring(2));

        line = lines[++currentLine];
        var y = parseInt(line.substring(2));

        size = {
            x: x,
            y: y
        };

        // skip position
        currentLine += 2;

        var pixel;

        if (animationLength === 0) {
            pixel = new PixelField(x, y, factor);
            animation = [pixel];
        } else {
            var result = [];

            for (var i = 0; i < animationLength; i++) {
                line = lines[++currentLine];

                if (line !== "-") {
                    alert("Datei beschädigt!");
                    reset();
                    return;
                }

                pixel = new PixelField(x, y, factor);

                for (var j = 0; j < x; j++) {
                    for (var k = 0; k < y; k++) {
                        line = lines[++currentLine];

                        var color = parseColor(line.split(":")[1]);
                        pixel.setColor(j, k, color);
                    }
                }

                result.push(pixel);
            }

            animation = result;
        }

        animation.forEach(function (pixel) {
            addPixelField(pixel);
        });

        panels.tabs.querySelector(".tab").classList.add("tab-current");
        current = 0;

        var render = function () {
            if (currentFrameStart < 1 * new Date - frameTime) {
                currentFrame = (currentFrame + 1) % animation.length;

                if (typeof animation[currentFrame] !== "undefined") {
                    animation[currentFrame].render(previewCanvas, 2);
                } else {
                    return;
                }

                currentFrameStart = 1 * new Date;
            }


            window.requestAnimationFrame(render);
        };

        window.requestAnimationFrame(render);

        canvas.addEventListener("click", function (e) {
            var x = 0, y = 0;

            if (e.pageX || e.pageY) {
                x = e.pageX;
                y = e.pageY;
            } else if (e.clientX || e.clientY) {
                x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
                y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
            }

            var offX = 0, offY = 0;
            var obj = this;

            do {
                offX += obj.offsetLeft;
                offY += obj.offsetTop;
            } while (obj = obj.offsetParent);

            x -= offX + translate.x - 1;
            y -= offY + translate.y - 1;

            x = parseInt(Math.floor(x / 15 / scale * 100));
            y = parseInt(Math.floor(y / 15 / scale * 100));

            if (e.buttons === 1 || e.which === 1) {
                currentTool.onClick(x, y, animation[current]);
                saved = false;
            }
        });

        canvas.addEventListener("mousemove", function (e) {
            var x = 0, y = 0;

            if (e.pageX || e.pageY) {
                x = e.pageX;
                y = e.pageY;
            } else if (e.clientX || e.clientY) {
                x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
                y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
            }

            var offX = 0, offY = 0;
            var obj = this;

            do {
                offX += obj.offsetLeft;
                offY += obj.offsetTop;
            } while (obj = obj.offsetParent);

            x -= offX + translate.x - 1;
            y -= offY + translate.y - 1;

            x = parseInt(Math.floor(x / 15 / scale * 100));
            y = parseInt(Math.floor(y / 15 / scale * 100));

            var which = "buttons" in e ? e.buttons : e.which;

            if (which === 1) { // left button
                currentTool.onDrag(x, y, animation[current]);
                saved = false;
            }
        });

        document.getElementById("editorpane").addEventListener("mousemove", function (e) {
            if (e.which === 2 || e.buttons === 3 || e.buttons === 4 || 32 in window.keysDown) { // mouse wheel or both buttons
                var movement = {
                    x: e.movementX,
                    y: e.movementY
                };

                if (e.mozMovementX || e.mozMovementY) {
                    movement = {
                        x: e.mozMovementX,
                        y: e.mozMovementY
                    };
                }

                translate.x += movement.x;
                translate.y += movement.y;
                canvas.style.webkitTransform = "translate(" + translate.x + "px," + translate.y + "px)";
                canvas.style.mozTransform = "translate(" + translate.x + "px," + translate.y + "px)";
                canvas.style.transform = "translate(" + translate.x + "px," + translate.y + "px)";
            }
        });

        var onMouseWheel = function (e) {
            console.log(e);

            if (window.ctrlDown) {
                e.preventDefault();

                var amount = "detail" in e && e.detail !== 0 ? -40 * e.detail : e.wheelDelta;

                scale += amount / 10;

                translate.x += size.x * amount / 1000;
                translate.y += size.y * amount / 1000;

                canvas.style.webkitTransform = "translate(" + translate.x + "px," + translate.y + "px)";
                canvas.style.mozTransform = "translate(" + translate.x + "px," + translate.y + "px)";
                canvas.style.transform = "translate(" + translate.x + "px," + translate.y + "px)";

                repaint();
            }
        };

        // IE9, Chrome, Safari, Opera
        document.addEventListener("mousewheel", onMouseWheel, false);
        // Firefox
        document.addEventListener("DOMMouseScroll", onMouseWheel, false);

        document.querySelectorAll(".tool").forEach(function (node) {
            node.addEventListener("click", function () {
                var n = document.querySelector(".tool-current");

                if (n) {
                    n.classList.remove("tool-current");
                }

                node.classList.add("tool-current");
                currentTool = tools[this.getAttribute("data-tool")];
            });
        });

        repaint();
    };

    var save = function () {
        var lines = [];

        lines.push(
            "_fig_",
            "an:" + animation.length,
            "f:" + 2, // TODO: right factor
            "x:" + size.x,
            "y:" + size.y,
            "p:" + 0,
            "q:" + 0
        );

        animation.forEach(function (pixel) {
            lines.push("-");

            var data = pixel.getData();

            for (var x in data) {
                if (!data.hasOwnProperty(x)) {
                    continue;
                }

                for (var y in data[x]) {
                    if (!data[x].hasOwnProperty(y)) {
                        continue;
                    }

                    lines.push("Z" + x + "-" + y + ":" + analyseColor(data[x][y]));
                }
            }
        });

        var blob = new Blob([lines.join("\n")], {
            type: "text/plain; charset=utf-8"
        });

        saveAs(blob, document.getElementById("filename").textContent);
        saved = true;
    };

    var close = function () {
        if (loaded && !saved && !confirm("Du hast ungespeicherte Änderungen. Willst du wirklich fortfahren?")) {
            return true;
        }

        reset();
    };

    var addPixelField = function (pixel, focus) {
        var node = Util.html2node(template.tab());
        node.addEventListener("click", function () {
            current = 0;

            panels.tabs.children.forEach(function (o, i) {
                if (o === node) {
                    current = i;
                }
            });

            var n = document.querySelector(".tab-current");

            if (n) {
                n.classList.remove("tab-current");
            }

            node.classList.add("tab-current");
            repaint();
        });

        node.querySelectorAll(".tab-menu-delete").forEach(function (o) {
            o.addEventListener("click", function (e) {
                saved = false;
                var curr = 0;

                panels.tabs.children.forEach(function (o, i) {
                    if (o === node) {
                        curr = i;
                    }
                });

                e.preventDefault();
                e.stopPropagation();

                animation.splice(curr, 1);
                node.parentNode.removeChild(node);

                if (current === animation.length) {
                    current--;
                }

                if (current === -1) {
                    var pixel = new PixelField(size.x, size.y);
                    animation.push(pixel);
                    addPixelField(pixel);
                    current = 0;
                }

                panels.tabs.children[current].classList.add("tab-current");
                repaint();
            });
        });

        pixel.setThumbNode(node.querySelector(".thumb"));
        panels.tabs.insertBefore(node, actions.insert);

        var curr = 0;

        panels.tabs.children.forEach(function (o, i) {
            if (o === node) {
                curr = i;
            }
        });

        if (focus) {
            current = curr;

            var n = document.querySelector(".tab-current");

            if (n) {
                n.classList.remove("tab-current");
            }

            node.classList.add("tab-current");
            repaint();
        }
    };

    var parseColor = function (input) {
        if (input === "%%;") {
            return null;
        }

        if (input.slice(0, 1) !== "&") {
            input = input.slice(1);

            if (input in Colors) {
                return Colors.input;
            }

            return null;
        }

        var rgb = [];
        var chars = input.split("");
        var tmp = 1;

        for (var i = 1; i < chars.length; i++) {
            if (chars[i] === "," || chars[i] === ";") {
                rgb.push(parseInt(input.slice(tmp, i)));
                tmp = i + 1;
            }
        }

        return new Color(rgb[0], rgb[1], rgb[2]);
    };

    var analyseColor = function (c) {
        if (c === null) {
            return "%%;";
        }

        switch (c) {
            case Colors.black:
                return "schwarz;";
            case Colors.gray:
                return "grau;";
            case Colors.green:
                return "gruen;";
            case Colors.yellow:
                return "gelb;";
            case Colors.blue:
                return "blau;";
            case Colors.white:
                return "weiss;";
            case Colors.orange:
                return "orange;";
            case Colors.red:
                return "rot;";
            case Colors.pink:
                return "pink;";
            case Colors.magenta:
                return "magenta;";
            case Colors.cyan:
                return "cyan;";
            case Colors.darkGray:
                return "dunkelgrau;";
            case Colors.lightGray:
                return "hellgrau;";
            default:
                return "&" + c.getRed() + "," + c.getGreen() + "," + c.getBlue() + ";";
        }
    };

    var repaint = function () {
        requestAnimationFrame(function () {
            var pixel = animation[current];
            pixel.render(canvas, 15 * scale / 100, true);
        });
    };

    var reset = function () {
        document.body.classList.add("body-intro");
        document.getElementById("filename").innerHTML = "&nbsp;";
        actions.save.classList.add("nodisplay");
        actions.close.classList.add("nodisplay");
        main.innerHTML = template.empty();
        loaded = false;
        saved = true;
        current = 0;
        animation = [];
        panels = {};
        size = {};
        canvas = null;
        previewCanvas = null;
        currentFrame = 0;
        currentFrameStart = 0;
    };

    exports.getCurrentColor = function () {
        var color = document.getElementById("colorpicker").querySelector("input").value;
        color = Util.hexToRgb(color);
        return color ? new Color(color.r, color.g, color.b) : null;
    };

    exports.repaint = function () {
        repaint();
    };

    reset();

    return exports;
};
