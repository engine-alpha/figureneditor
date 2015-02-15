"use strict";

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
        currentFrame = 0, currentFrameStart = 0, frameTime = 75;

    var main = document.getElementById("main");
    main.innerHTML = template.empty();

    var actions = {
        new: document.getElementById("action.new"),
        open: document.getElementById("action.open"),
        save: document.getElementById("action.save"),
        close: document.getElementById("action.close")
    };

    var input = document.getElementById("fileinput");
    input.addEventListener("change", function (e) {
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
    });

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

    };

    var load = function (name, data) {
        reset();

        document.getElementById("filename").textContent = name;
        main.innerHTML = template.main();
        canvas = document.getElementById("editorpane").querySelector("canvas");
        previewCanvas = document.getElementById("preview").querySelector("canvas");
        panels.tabs = main.querySelector("#tabs");
        actions.insert = document.getElementById("action.insert");
        actions.insert.addEventListener("click", function () {
            var pixel = new PixelField(size.x, size.y);

            animation.push(pixel);
            addPixelField(pixel, animation.length - 1);
        });

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
        var result = [];

        for (var i = 0; i < animationLength; i++) {
            line = lines[++currentLine];

            if (line !== "-") {
                alert("Datei beschädigt!");
                reset();
                return;
            }

            var pixel = new PixelField(x, y, factor);

            for (var j = 0; j < x; j++) {
                for (var k = 0; k < y; k++) {
                    line = lines[++currentLine];

                    var color = parseColor(line.split(":")[1]);
                    pixel.setColor(j, k, color);
                }
            }

            result.push(pixel);
        }

        result.forEach(function (pixel, i) {
            addPixelField(pixel, i);
        });

        panels.tabs.querySelector(".tab").classList.add("tab-current");

        animation = result;
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
    };

    var close = function () {
        if (loaded && !saved && !confirm("Du hast ungespeicherte Änderungen. Willst du wirklich fortfahren?")) {
            return true;
        }

        reset();
    };

    var addPixelField = function (pixel, i) {
        var node = Util.html2node(template.tab());
        node.addEventListener("click", function () {
            current = i;

            var n = document.querySelector(".tab-current");

            if (n) {
                n.classList.remove("tab-current");
            }

            node.classList.add("tab-current");
            repaint();
        });

        pixel.setThumbNode(node.querySelector(".thumb"));
        panels.tabs.insertBefore(node, actions.insert);
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
        var pixel = animation[current];
        pixel.render(canvas, 15);
    };

    var reset = function () {
        document.getElementById("filename").innerHTML = "&nbsp;";
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

    return {
        save: save
    };
};
