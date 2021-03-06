(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Context2DTracked"] = factory();
	else
		root["Context2DTracked"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Matrix = __webpack_require__(2).Matrix;

function lastElement(array) {
    return array[array.length - 1];
}

function using(start, close, execute) {
    try {
        start.call(this);
        return execute.call(this);
    } finally {
        close.call(this);
    }
}

module.exports = function () {
    function Context2DTracked(target) {
        _classCallCheck(this, Context2DTracked);

        // use: const ctx = new Context2DTracked(canvas.getContext("2d"));
        // target is Canvas Context2D that will be wrapped and tracked
        this.context = target;

        this.tf = [new Matrix()]; // keep track of transformations

        // tracking where the current pen is on the canvas
        this.penx = 0;
        this.peny = 0;
        // at the beginning of the path
        this.justBegun = false;
        this.bpenx = 0;
        this.bpeny = 0;

        // translate
        this.ox = 0;
        this.oy = 0;

        // for fine control of when to show controls
        this.showcontrol = false;

        var deprecatedProperties = ['webkitImageSmoothingEnabled'];
        // "inherit" methods and properties from Context
        var origProps = Object.getOwnPropertyNames(target.__proto__);
        for (var i = 0; i < origProps.length; i++) {
            var p = origProps[i];
            if (deprecatedProperties.indexOf(p) >= 0) {
                continue;
            }
            if (typeof target[p] === "function") {
                // not providing an override, then just use the default
                if (typeof this[p] === "undefined") {
                    this[p] = target[p].bind(target);
                }
            }
            // make sure to access only 1 copy of the data
            else {
                    Object.defineProperty(this, p, {
                        get: function (p) {
                            return target[p];
                        }.bind(null, p),
                        set: function (p, v) {
                            return target[p] = v;
                        }.bind(null, p)
                    });
                }
        }
    }

    // new methods
    /**
     * Current transform
     */


    _createClass(Context2DTracked, [{
        key: "cf",
        value: function cf() {
            return lastElement(this.tf);
        }
    }, {
        key: "usingScaledLineWidth",
        value: function usingScaledLineWidth(execute) {
            var _this = this;

            var tmp = this.context.lineWidth;
            var start = function start() {
                _this.context.lineWidth *= Math.abs(_this.cf().a);
            };
            var close = function close() {
                _this.context.lineWidth = tmp;
            };
            return using.call(this, start, close, execute);
        }
    }, {
        key: "usingScaledFontSize",
        value: function usingScaledFontSize(execute) {
            var _this2 = this;

            var tmp = this.context.font;
            var info = tmp.split(' ');
            var newSize = Math.round(parseInt(info[0]) * Math.abs(this.cf().a));
            var start = function start() {
                _this2.context.font = newSize + 'px ' + info[info.length - 1];
            };
            var close = function close() {
                _this2.context.font = tmp;
            };
            return using.call(this, start, close, execute);
        }

        /**
         * Print crosshairs at the current pen location and return their locations
         */

    }, {
        key: "trace",
        value: function trace() {
            var x = this.penx,
                y = this.peny;
            console.log(Math.round(x * 10) / 10 + this.ox, Math.round(y * 10) / 10 + this.oy);
            // assume path
            // has begun
            this.context.moveTo(x - 5, y);
            this.context.lineTo(x + 5, y);
            this.context.moveTo(x, y + 5);
            this.context.lineTo(x, y - 5);
            this.context.moveTo(x, y);
            return {
                x: x,
                y: y
            };
        }
    }, {
        key: "transformPoint",


        /**
         * Transforms a point in base coordinates to context coordinates by applying the transforms the context went through
         * @param x
         * @param y
         * @returns {*|{x, y}|{x: number, y: number}}
         */
        value: function transformPoint(x, y) {
            // transforms a point into context coordinates
            var invtf = lastElement(this.tf).inverse();
            return invtf.applyToPoint(x, y);
        }
    }, {
        key: "transformCoordinate",
        value: function transformCoordinate(x, y) {
            // transform context coordinates into a point
            return lastElement(this.tf).applyToPoint(x, y);
        }

        // wrapping around existing methods
        // transformation handling

    }, {
        key: "save",
        value: function save() {
            this.tf.push(lastElement(this.tf).clone());
            this.context.save();
        }
    }, {
        key: "restore",
        value: function restore() {
            this.tf.pop();
            this.context.restore();
        }
    }, {
        key: "scale",
        value: function scale(x, y) {
            lastElement(this.tf).scale(x, y);
        }
    }, {
        key: "translate",
        value: function translate(x, y) {
            lastElement(this.tf).translate(x, y);
        }
    }, {
        key: "setTransform",
        value: function setTransform(a, b, c, d, e, f) {
            lastElement(this.tf).setTransform(a, b, c, d, e, f);
        }
    }, {
        key: "rotate",
        value: function rotate(angle) {
            lastElement(this.tf).rotate(angle);
        }
    }, {
        key: "movePen",
        value: function movePen(x, y) {
            var t = this.cf().applyToPoint(x, y);
            if (this.justBegun) {
                this.justBegun = false;
                this.bpenx = t.x;
                this.bpeny = t.y;
            }
            this.penx = t.x;
            this.peny = t.y;
        }

        // methods that have positions so need us to apply the points...

    }, {
        key: "_rect",
        value: function _rect(x, y, width, height, op) {
            var t = this.cf().applyToPoint(x, y);
            var s = this.cf().applyToPoint(width, height);
            op.call(this.context, t.x, t.y, s.x, s.y);
        }
    }, {
        key: "clearRect",
        value: function clearRect(x, y, width, height) {
            this._rect.apply(this, Array.prototype.slice.call(arguments).concat([this.context.clearRect]));
        }
    }, {
        key: "fillRect",
        value: function fillRect(x, y, width, height) {
            this._rect.apply(this, Array.prototype.slice.call(arguments).concat([this.context.fillRect]));
        }
    }, {
        key: "strokeRect",
        value: function strokeRect(x, y, width, height) {
            var _this3 = this,
                _arguments = arguments;

            this.usingScaledLineWidth(function () {
                _this3._rect.apply(_this3, Array.prototype.slice.call(_arguments).concat([_this3.context.strokeRect]));
            });
        }
    }, {
        key: "rect",
        value: function rect(x, y, width, height) {
            this._rect.apply(this, Array.prototype.slice.call(arguments).concat([this.context.rect]));
        }
    }, {
        key: "fillText",
        value: function fillText(text, x, y, maxWidth) {
            var _this4 = this;

            var t = this.cf().applyToPoint(x, y);
            this.usingScaledFontSize(function () {
                _this4.context.fillText(text, t.x, t.y, maxWidth);
            });
        }
    }, {
        key: "strokeText",
        value: function strokeText(text, x, y, maxWidth) {
            var _this5 = this;

            var t = this.cf().applyToPoint(x, y);
            this.usingScaledLineWidth(function () {
                _this5.usingScaledFontSize(function () {
                    _this5.context.strokeText(text, t.x, t.y, maxWidth);
                });
            });
        }
    }, {
        key: "createLinearGradient",
        value: function createLinearGradient(x0, y0, x1, y1) {
            var t0 = this.cf().applyToPoint(x0, y0);
            var t1 = this.cf().applyToPoint(x1, y1);
            return this.context.createLinearGradient(t0.x, t0.y, t1.x, t1.y);
        }
    }, {
        key: "createRadialGradient",
        value: function createRadialGradient(x0, y0, r0, x1, y1, r1) {
            var t0 = this.cf().applyToPoint(x0, y0);
            var t1 = this.cf().applyToPoint(x1, y1);
            // TODO problematic radius because we can't transform differently for x and y
            var tr0 = Math.abs(this.cf().a * r0);
            var tr1 = Math.abs(this.cf().a * r1);
            return this.context.createRadialGradient(t0.x, t0.y, tr0, t1.x, t1.y, tr1);
        }

        // methods that change pen position will be overriden

    }, {
        key: "beginPath",
        value: function beginPath() {
            this.justBegun = true;
            this.context.beginPath();
        }
    }, {
        key: "moveTo",
        value: function moveTo(x, y) {
            this.movePen(x, y);
            var t = this.cf().applyToPoint(x, y);
            this.context.moveTo(t.x, t.y);
        }
    }, {
        key: "lineTo",
        value: function lineTo(x, y, debugOptions) {
            var t = this.cf().applyToPoint(x, y);
            if (debugOptions || this.showcontrol) {
                var options = Object.assign(this._getDefaultDebugOptions(), debugOptions);
                this._drawCurveControl(this._getDebugPoint(t.x, t.y), options);
            }
            this.context.lineTo(t.x, t.y);
            this.movePen(x, y);
        }
    }, {
        key: "bezierCurveTo",
        value: function bezierCurveTo(cpx1, cpy1, cpx2, cpy2, x, y, debugOptions) {
            var t = this.cf().applyToPoint(x, y);
            var tcp1 = this.cf().applyToPoint(cpx1, cpy1);
            var tcp2 = this.cf().applyToPoint(cpx2, cpy2);
            if (debugOptions || this.showcontrol) {
                var options = Object.assign(this._getDefaultDebugOptions(), debugOptions);
                this._drawCurveControl(this._getDebugPoint(t.x, t.y, tcp1.x, tcp1.y, tcp2.x, tcp2.y), options);
            }
            // rest of curve
            this.context.bezierCurveTo(tcp1.x, tcp1.y, tcp2.x, tcp2.y, t.x, t.y);
            this.movePen(x, y);
        }
    }, {
        key: "quadraticCurveTo",
        value: function quadraticCurveTo(cpx, cpy, x, y, debugOptions) {
            var t = this.cf().applyToPoint(x, y);
            var tcp = this.cf().applyToPoint(cpx, cpy);
            if (debugOptions || this.showcontrol) {
                var options = Object.assign(this._getDefaultDebugOptions(), debugOptions);
                this._drawCurveControl(this._getDebugPoint(t.x, t.y, tcp.x, tcp.y), options);
            }
            // rest of curve
            this.context.quadraticCurveTo(tcp.x, tcp.y, t.x, t.y);
            this.movePen(x, y);
        }
    }, {
        key: "arc",
        value: function arc(x, y, radius, startAngle, endAngle, anticlockwise) {
            var t = this.cf().applyToPoint(x, y);
            // TODO problematic radius because we can't transform differently for x and y
            // we'll just use the x scale
            var r = this.cf().a * radius;
            // first move to starting location
            // using a bit of trig
            var sx = t.x + Math.cos(startAngle) * r,
                sy = t.y + Math.sin(startAngle) * r;
            this.movePen(sx, sy);
            // draw arc
            this.context.arc(t.x, t.y, r, startAngle, endAngle, anticlockwise);

            var ex = t.x + Math.cos(endAngle) * r,
                ey = t.y + Math.sin(endAngle) * r;
            this.movePen(ex, ey);
            // bug? fills to the start of the
            // path, but the continuation for
            // the next part of the line is
            // actually the end point
            this.bpenx = ex;
            this.bpeny = ey;
        }
    }, {
        key: "drawImage",
        value: function drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight) {
            var s = this.cf().applyToPoint(sx, sy);
            if (sWidth === undefined) {
                this.context.drawImage(image, s.x, s.y);
                return;
            }
            var sdim = this.cf().applyToPoint(sWidth, sHeight);
            if (dx === undefined) {
                this.context.drawImage(image, s.x, s.y, sdim.x, sdim.y);
                return;
            }
            var d = this.cf().applyToPoint(dx, dy);
            var ddim = this.cf().applyToPoint(dWidth, dHeight);
            this.context.drawImage(image, s.x, s.y, sdim.x, sdim.y, d.x, d.y, ddim.x, ddim.y);
        }
    }, {
        key: "putImageData",
        value: function putImageData(imageData, dx, dy, dirtyX, dirtyY, dirtyWidth, dirtyHeight) {
            var d = this.cf().applyToPoint(dx, dy);
            if (dirtyX === undefined) {
                this.context.putImageData(imageData, d.x, d.y);
                return;
            }
            var dirty = this.cf().applyToPoint(dirtyX, dirtyY);
            var dim = this.cf().applyToPoint(dirtyWidth, dirtyHeight);
            this.context.putImageData(imageData, d.x, d.y, dirty.x, dirty.y, dim.x, dim.y);
        }

        // UNSUPPORTED functions (behaviour will be unexpected): ellipse, arcTo,

    }, {
        key: "stroke",
        value: function stroke() {
            var _this6 = this;

            // have to manually do this because we're not scaling context
            if (this.context.strokeStyle !== "rgba(0, 0, 0, 0)") {
                this.usingScaledLineWidth(function () {
                    _this6.context.stroke();
                });
            }
        }

        // fill always draws straight
        // line to point starting the
        // path

    }, {
        key: "fill",
        value: function fill() {
            this.movePen(this.bpenx, this.bpeny);
            this.context.fill.apply(this.context, arguments);
        }
    }, {
        key: "clip",
        value: function clip() {
            this.movePen(this.bpenx, this.bpeny);
            this.context.clip.apply(this.context, arguments);
        }

        // new utility methods

    }, {
        key: "_drawCurveControl",
        value: function _drawCurveControl(point, style) {
            this.context.save();
            // assume path
            // has already
            // begun

            var ptprint = [point.p1];
            // draw control
            // lines
            this.context.strokeStyle = style.controlLine.color;
            this.context.lineWidth = style.controlLine.width;
            if (point.cp1) {
                this.context.moveTo(point.p1.x, point.p1.y);
                this.context.lineTo(point.cp1.x, point.cp1.y);
                ptprint.push(point.cp1);
                if (point.cp2) {
                    // 2
                    // control
                    // points,
                    // cubic
                    // bezier
                    this.context.lineTo(point.cp2.x, point.cp2.y);
                    this.context.lineTo(point.p2.x, point.p2.y);
                    ptprint.push(point.cp2);
                } else {
                    this.context.lineTo(point.p2.x, point.p2.y);
                }
            }
            this.context.stroke();
            ptprint.push(point.p2);

            // control
            // points
            for (var i = 0; i < ptprint.length; ++i) {
                var p = ptprint[i];
                ptprint[i] = "(" + Math.round(ptprint[i].x * 10) / 10 + ", " + Math.round(ptprint[i].y * 10) / 10 + ")";
                this.context.lineWidth = style.point.width;
                // use different colour for destination colour
                if (p === point.p2) {
                    this.context.strokeStyle = style.point.destinationColor;
                } else {
                    this.context.strokeStyle = style.point.color;
                }
                this.context.fillStyle = style.point.fill;
                this.context.beginPath();
                this.context.arc(p.x, p.y, style.point.radius, 0, 2 * Math.PI, true);

                this.context.fill();
                // target.font = style.point.radius * 4 + "px arial";
                // target.fillStyle = "black";
                // target.fillText(i + 1, p.x, p.y + style.point.radius * 5);
                this.context.stroke();
            }
            console.log("from points", ptprint.join(" to "));

            this.context.restore();
            this.context.beginPath(); // return to
            // previously
            // open path
            this.context.moveTo(point.p1.x, point.p1.y);
        }
    }, {
        key: "_getDebugPoint",
        value: function _getDebugPoint(x, y, cpx1, cpy1, cpx2, cpy2) {
            var point = {
                p1: {
                    x: this.penx,
                    y: this.peny
                },
                p2: {
                    x: x,
                    y: y
                }
            };
            if (typeof cpx1 === "number" && typeof cpy1 === "number") {
                point.cp1 = {
                    x: cpx1,
                    y: cpy1
                };
                if (typeof cpx2 === "number" && typeof cpy2 === "number") {
                    point.cp2 = {
                        x: cpx2,
                        y: cpy2
                    };
                }
            }
            return point;
        }
    }, {
        key: "_getDefaultDebugOptions",
        value: function _getDefaultDebugOptions() {
            return {
                controlLine: {
                    color: "rgb(200,100,100)",
                    width: 0.5
                },
                point: {
                    color: "rgb(200,50,50)",
                    destinationColor: "#000",
                    fill: "white",
                    width: 1,
                    radius: 1
                }
            };
        }
    }]);

    return Context2DTracked;
}();

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Created by Johnson on 2017-04-03.
 */
module.exports = __webpack_require__(0);

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

/*!
	2D Transformation Matrix v2.7.1
	(c) Epistemex.com 2014-2017
	License: MIT, header required.
*/

/**
 * 2D transformation matrix object initialized with identity matrix.
 *
 * The matrix can synchronize a canvas 2D context by supplying the context
 * as an argument, or later apply current absolute transform to an
 * existing context.
 *
 * To synchronize a DOM element you can use [`toCSS()`]{@link Matrix#toCSS} or [`toCSS3D()`]{@link Matrix#toCSS3D}.
 *
 * @param {CanvasRenderingContext2D} [context] - Optional context to sync with Matrix
 * @param {HTMLElement} [element=null] - DOM Element to synchronize
 * @prop {number} a - scale x
 * @prop {number} b - shear y
 * @prop {number} c - shear x
 * @prop {number} d - scale y
 * @prop {number} e - translate x
 * @prop {number} f - translate y
 * @prop {CanvasRenderingContext2D} [context] - set or get current synchronized 2D context
 * @prop {HTMLElement} [element] - get current synchronized DOM element
 * @prop {boolean} [useCSS3D=false] - is a DOM element is defined for sync., choose whether to use 2D (false) or 3D (true) matrix to sync it.
 * @constructor
 * @license MIT license (header required)
 * @copyright Epistemex.com 2014-2016
 */
function Matrix(context, element) {

	var me = this, _el;
	me._t = me.transform;

	me.a = me.d = 1;
	me.b = me.c = me.e = me.f = 0;

	// sync context
	if (context)
		(me.context = context).setTransform(1, 0, 0, 1, 0, 0);

	// sync DOM element
	Object.defineProperty(me, "element", {
		get: function() {return _el},
		set: function(el) {
			if (!_el) {
				me._px = me._getPX();
				me.useCSS3D = false
			}
			_el = el;
			(me._st = _el.style)[me._px] = me.toCSS();
		}
	});

	if (element) me.element = element
}

/**
 * Returns a new matrix that transforms a triangle `t1` into another triangle
 * `t2`, or throws an exception if it is impossible.
 *
 * Note: the method can take both arrays as well as literal objects.
 * Just make sure that both arguments (`t1`, `t2`) are of the same type.
 *
 * @param {{px: number, py: number, qx: number, qy: number, rx: number, ry: number}|Array} t1 - Object or array containing the three points for the triangle.
 * For object use obj.px, obj.py, obj.qx, obj.qy, obj.rx and obj.ry. For arrays provide the points in the order [px, py, qx, qy, rx, ry], or as point array [{x:,y:}, {x:,y:}, {x:,y:}]
 * @param {{px: number, py: number, qx: number, qy: number, rx: number, ry: number}|Array} t2 - See description for t1.
 * @param {CanvasRenderingContext2D} [context] - optional canvas 2D context to use for the matrix
 * @returns {Matrix}
 * @throws Exception is matrix becomes not invertible
 * @static
 */
Matrix.fromTriangles = function(t1, t2, context) {

	var m1 = new Matrix(),
		m2 = new Matrix(context),
		r1, r2, rx1, ry1, rx2, ry2;

	if (Array.isArray(t1)) {
		if (typeof t1[0] === "number") {
			rx1 = t1[4]; ry1 = t1[5]; rx2 = t2[4]; ry2 = t2[5];
			r1 = [t1[0] - rx1, t1[1] - ry1, t1[2] - rx1, t1[3] - ry1, rx1, ry1];
			r2 = [t2[0] - rx2, t2[1] - ry2, t2[2] - rx2, t2[3] - ry2, rx2, ry2]
		}
		else {
			rx1 = t1[2].x; ry1 = t1[2].y; rx2 = t2[2].x; ry2 = t2[2].y;
			r1 = [t1[0].x - rx1, t1[0].y - ry1, t1[1].x - rx1, t1[1].y - ry1, rx1, ry1];
			r2 = [t2[0].x - rx2, t2[0].y - ry2, t2[1].x - rx2, t2[1].y - ry2, rx2, ry2]
		}
	}
	else {
		r1 = [t1.px - t1.rx, t1.py - t1.ry, t1.qx - t1.rx, t1.qy - t1.ry, t1.rx, t1.ry];
		r2 = [t2.px - t2.rx, t2.py - t2.ry, t2.qx - t2.rx, t2.qy - t2.ry, t2.rx, t2.ry]
	}

	m1.setTransform.apply(m1, r1);
	m2.setTransform.apply(m2, r2);

	return m2.multiply(m1.inverse())
};

/**
 * Create a matrix from a transform list from an SVG shape. The list
 * can be for example baseVal (i.e. `shape.transform.baseVal`).
 *
 * The resulting matrix has all transformations from that list applied
 * in the same order as the list.
 *
 * @param {SVGTransformList} tList - transform list from an SVG shape.
 * @param {CanvasRenderingContext2D} [context] - optional canvas 2D context to use for the matrix
 * @param {HTMLElement} [dom] - optional DOM element to use for the matrix
 * @returns {Matrix}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/SVGTransformList|MDN / SVGTransformList}
 */
Matrix.fromSVGTransformList = function(tList, context, dom) {

	var m = new Matrix(context, dom),
		i = 0;

	while(i < tList.length)
		m.multiply(tList[i++].matrix);

	return m
};

/**
 * Create and transform a new matrix based on given matrix values, or
 * provide SVGMatrix or a (2D) DOMMatrix or another instance of a Matrix
 * (in fact, any 2D matrix object using properties a-f can be used as source).
 *
 * @example
 *
 * var m = Matrix.from(1, 0.2, 0, 2, 120, 97);
 * var m = Matrix.from(domMatrix, ctx);
 * var m = Matrix.from(svgMatrix);
 * var m = Matrix.from(matrix);
 * var m = Matrix.from(vector [,pre-x] [,pre-y] [,doScale]);
 *
 * @param {*} a - number representing a in [a-f], or a Matrix object containing properties a-f. Vector is given as an object with properties x and y.
 * @param {*} [b] - b property if a is not a matrix object, or optional canvas 2D context.
 * If vector is input this will be pre-translate for x.
 * @param {number} [c] - If vector is input this will be pre-translate for y.
 * @param {number} [d] - If vector is input, set this to true to use scale and translate of 1,
 * false to use hypotenuse as translate distance instead and no scale.
 * @param {number} [e]
 * @param {number} [f]
 * @param {CanvasRenderingContext2D} [context] - optional canvas context to synchronize
 * @param {HTMLElement} [dom] - optional DOM element to use for the matrix
 * @returns {Matrix}
 * @static
 */
Matrix.from = function(a, b, c, d, e, f, context, dom) {

	var m = new Matrix(context, dom), scale, dist, q;

	if (typeof a === "number")
		m.setTransform(a, b, c, d, e, f);

	else if (typeof a.x === "number") {		// vector

		q = Math.sqrt(a.x*a.x + a.y*a.y);
		scale = dist = 1;

		if (d) scale = q;
		else dist = q;

		m
			.translate(b || 0, c || 0)
			.rotateFromVector(a)
			.scaleU(scale)
			.translate(dist, 0);

	}
	else {
		if (typeof a.is2D === "boolean" && !a.is2D) throw "Cannot use 3D DOMMatrix.";
		if (b) m.context = b;
		if (c) m.element = c;
		m.multiply(a)
	}

	return m
};

Matrix.prototype = {

	_getPX: function() {

		var lst   = ["t", "oT", "msT", "mozT", "webkitT", "khtmlT"], i = 0, p,
			style = document.createElement("div").style;

		while(p = lst[i++])
			if (typeof style[p + "ransform"] !== "undefined") return p + "ransform";
	},

	/**
	 * Concatenates transforms of this matrix onto the given child matrix and
	 * returns a new matrix. This instance is used on left side.
	 *
	 * @param {Matrix|SVGMatrix} cm - child matrix to apply concatenation to
	 * @returns {Matrix} - new Matrix instance
	 */
	concat: function(cm) {
		return this.clone().multiply(cm)
	},

	/**
	 * Flips the horizontal values.
	 * @returns {Matrix}
	 */
	flipX: function() {
		return this._t(-1, 0, 0, 1, 0, 0)
	},

	/**
	 * Flips the vertical values.
	 * @returns {Matrix}
	 */
	flipY: function() {
		return this._t(1, 0, 0, -1, 0, 0)
	},

	/**
	 * Reflects incoming (velocity) vector on the normal which will be the
	 * current transformed x axis. Call when a trigger condition is met.
	 *
	 * @param {number} x - vector end point for x (start = 0)
	 * @param {number} y - vector end point for y (start = 0)
	 * @returns {{x: number, y: number}}
	 */
	reflectVector: function(x, y) {

		var v = this.applyToPoint(0, 1),
			d = (v.x * x + v.y * y) * 2;

		x -= d * v.x;
		y -= d * v.y;

		return {x: x, y: y}
	},

	/**
	 * Short-hand to reset current matrix to an identity matrix.
	 * @returns {Matrix}
	 */
	reset: function() {
		return this.setTransform(1, 0, 0, 1, 0, 0)
	},

	/**
	 * Rotates current matrix by angle (accumulative).
	 * @param {number} angle - angle in radians
	 * @returns {Matrix}
	 */
	rotate: function(angle) {
		var cos = Math.cos(angle),
			sin = Math.sin(angle);
		return this._t(cos, sin, -sin, cos, 0, 0)
	},

	/**
	 * Converts a vector given as `x` and `y` to angle, and
	 * rotates (accumulative). x can instead contain an object with
	 * properties x and y and if so, y parameter will be ignored.
	 * @param {number|*} x
	 * @param {number} [y]
	 * @returns {Matrix}
	 */
	rotateFromVector: function(x, y) {
		return this.rotate(typeof x === "number" ? Math.atan2(y, x) : Math.atan2(x.y, x.x))
	},

	/**
	 * Helper method to make a rotation based on an angle in degrees.
	 * @param {number} angle - angle in degrees
	 * @returns {Matrix}
	 */
	rotateDeg: function(angle) {
		return this.rotate(angle * Math.PI / 180)
	},

	/**
	 * Scales current matrix uniformly and accumulative.
	 * @param {number} f - scale factor for both x and y (1 does nothing)
	 * @returns {Matrix}
	 */
	scaleU: function(f) {
		return this._t(f, 0, 0, f, 0, 0)
	},

	/**
	 * Scales current matrix accumulative.
	 * @param {number} sx - scale factor x (1 does nothing)
	 * @param {number} sy - scale factor y (1 does nothing)
	 * @returns {Matrix}
	 */
	scale: function(sx, sy) {
		return this._t(sx, 0, 0, sy, 0, 0)
	},

	/**
	 * Scales current matrix on x axis accumulative.
	 * @param {number} sx - scale factor x (1 does nothing)
	 * @returns {Matrix}
	 */
	scaleX: function(sx) {
		return this._t(sx, 0, 0, 1, 0, 0)
	},

	/**
	 * Scales current matrix on y axis accumulative.
	 * @param {number} sy - scale factor y (1 does nothing)
	 * @returns {Matrix}
	 */
	scaleY: function(sy) {
		return this._t(1, 0, 0, sy, 0, 0)
	},

	/**
	 * Converts a vector given as `x` and `y` to normalized scale.
	 * @param x
	 * @param y
	 * @returns {Matrix}
	 */
	scaleFromVector: function(x, y) {
		return this.scaleU(Math.sqrt(x*x + y*y))
	},

	/**
	 * Apply shear to the current matrix accumulative.
	 * @param {number} sx - amount of shear for x
	 * @param {number} sy - amount of shear for y
	 * @returns {Matrix}
	 */
	shear: function(sx, sy) {
		return this._t(1, sy, sx, 1, 0, 0)
	},

	/**
	 * Apply shear for x to the current matrix accumulative.
	 * @param {number} sx - amount of shear for x
	 * @returns {Matrix}
	 */
	shearX: function(sx) {
		return this._t(1, 0, sx, 1, 0, 0)
	},

	/**
	 * Apply shear for y to the current matrix accumulative.
	 * @param {number} sy - amount of shear for y
	 * @returns {Matrix}
	 */
	shearY: function(sy) {
		return this._t(1, sy, 0, 1, 0, 0)
	},

	/**
	 * Apply skew to the current matrix accumulative. Angles in radians.
	 * Also see [`skewDeg()`]{@link Matrix#skewDeg}.
	 * @param {number} ax - angle of skew for x
	 * @param {number} ay - angle of skew for y
	 * @returns {Matrix}
	 */
	skew: function(ax, ay) {
		return this.shear(Math.tan(ax), Math.tan(ay))
	},

	/**
	 * Apply skew to the current matrix accumulative. Angles in degrees.
	 * Also see [`skew()`]{@link Matrix#skew}.
	 * @param {number} ax - angle of skew for x
	 * @param {number} ay - angle of skew for y
	 * @returns {Matrix}
	 */
	skewDeg: function(ax, ay) {
		return this.shear(Math.tan(ax / 180 * Math.PI), Math.tan(ay / 180 * Math.PI))
	},

	/**
	 * Apply skew for x to the current matrix accumulative. Angles in radians.
	 * Also see [`skewDeg()`]{@link Matrix#skewDeg}.
	 * @param {number} ax - angle of skew for x
	 * @returns {Matrix}
	 */
	skewX: function(ax) {
		return this.shearX(Math.tan(ax))
	},

	/**
	 * Apply skew for y to the current matrix accumulative. Angles in radians.
	 * Also see [`skewDeg()`]{@link Matrix#skewDeg}.
	 * @param {number} ay - angle of skew for y
	 * @returns {Matrix}
	 */
	skewY: function(ay) {
		return this.shearY(Math.tan(ay))
	},

	/**
	 * Set current matrix to new absolute matrix.
	 * @param {number} a - scale x
	 * @param {number} b - shear y
	 * @param {number} c - shear x
	 * @param {number} d - scale y
	 * @param {number} e - translate x
	 * @param {number} f - translate y
	 * @returns {Matrix}
	 */
	setTransform: function(a, b, c, d, e, f) {
		var me = this;
		me.a = a;
		me.b = b;
		me.c = c;
		me.d = d;
		me.e = e;
		me.f = f;
		return me._x()
	},

	/**
	 * Translate current matrix accumulative.
	 * @param {number} tx - translation for x
	 * @param {number} ty - translation for y
	 * @returns {Matrix}
	 */
	translate: function(tx, ty) {
		return this._t(1, 0, 0, 1, tx, ty)
	},

	/**
	 * Translate current matrix on x axis accumulative.
	 * @param {number} tx - translation for x
	 * @returns {Matrix}
	 */
	translateX: function(tx) {
		return this._t(1, 0, 0, 1, tx, 0)
	},

	/**
	 * Translate current matrix on y axis accumulative.
	 * @param {number} ty - translation for y
	 * @returns {Matrix}
	 */
	translateY: function(ty) {
		return this._t(1, 0, 0, 1, 0, ty)
	},

	/**
	 * Multiplies current matrix with new matrix values. Also see [`multiply()`]{@link Matrix#multiply}.
	 *
	 * @param {number} a2 - scale x
	 * @param {number} b2 - skew y
	 * @param {number} c2 - skew x
	 * @param {number} d2 - scale y
	 * @param {number} e2 - translate x
	 * @param {number} f2 - translate y
	 * @returns {Matrix}
	 */
	transform: function(a2, b2, c2, d2, e2, f2) {

		var me = this,
			a1 = me.a,
			b1 = me.b,
			c1 = me.c,
			d1 = me.d,
			e1 = me.e,
			f1 = me.f;

		/* matrix column order is:
		 *   a c e
		 *   b d f
		 *   0 0 1
		 */
		me.a = a1 * a2 + c1 * b2;
		me.b = b1 * a2 + d1 * b2;
		me.c = a1 * c2 + c1 * d2;
		me.d = b1 * c2 + d1 * d2;
		me.e = a1 * e2 + c1 * f2 + e1;
		me.f = b1 * e2 + d1 * f2 + f1;

		return me._x()
	},

	/**
	 * Multiplies current matrix with source matrix.
	 * @param {Matrix|DOMMatrix|SVGMatrix} m - source matrix to multiply with.
	 * @returns {Matrix}
	 */
	multiply: function(m) {
		return this._t(m.a, m.b, m.c, m.d, m.e, m.f)
	},

	/**
	 * Divide this matrix on input matrix which must be invertible.
	 * @param {Matrix} m - matrix to divide on (divisor)
	 * @throws Exception if input matrix is not invertible
	 * @returns {Matrix}
	 */
	divide: function(m) {
		return this.multiply(m.inverse())
	},

	/**
	 * Divide current matrix on scalar value != 0.
	 * @param {number} d - divisor
	 * @throws Exception if divisor is zero
	 * @returns {Matrix}
	 */
	divideScalar: function(d) {

		var me = this;

		if (!d) throw "Division on zero";

		me.a /= d;
		me.b /= d;
		me.c /= d;
		me.d /= d;
		me.e /= d;
		me.f /= d;

		return me._x()
	},

	/**
	 * Get an inverse matrix of current matrix. The method returns a new
	 * matrix with values you need to use to get to an identity matrix.
	 * Context from parent matrix is not applied to the returned matrix.
	 *
	 * @param {boolean} [cloneContext=false] - clone current context to resulting matrix
	 * @param {boolean} [cloneDOM=false] - clone current DOM element to resulting matrix
	 * @throws Exception is input matrix is not invertible
	 * @returns {Matrix} - new Matrix instance
	 */
	inverse: function(cloneContext, cloneDOM) {

		var me = this,
			m  = new Matrix(cloneContext ? me.context : null, cloneDOM ? me.element : null),
			dt = me.determinant();

		if (me._q(dt, 0))
			throw "Matrix not invertible.";

		m.a = me.d / dt;
		m.b = -me.b / dt;
		m.c = -me.c / dt;
		m.d = me.a / dt;
		m.e = (me.c * me.f - me.d * me.e) / dt;
		m.f = -(me.a * me.f - me.b * me.e) / dt;

		return m
	},

	/**
	 * Interpolate this matrix with another and produce a new matrix.
	 * `t` is a value in the range [0.0, 1.0] where 0 is this instance and
	 * 1 is equal to the second matrix. The `t` value is not clamped.
	 *
	 * Context from parent matrix is not applied to the returned matrix.
	 *
	 * Note: this interpolation is naive. For animation containing rotation,
	 * shear or skew use the [`interpolateAnim()`]{@link Matrix#interpolateAnim} method instead
	 * to avoid unintended flipping.
	 *
	 * @param {Matrix|SVGMatrix} m2 - the matrix to interpolate with.
	 * @param {number} t - interpolation [0.0, 1.0]
	 * @param {CanvasRenderingContext2D} [context] - optional context to affect
	 * @param {HTMLElement} [dom] - optional DOM element to use for the matrix
	 * @returns {Matrix} - new Matrix instance with the interpolated result
	 */
	interpolate: function(m2, t, context, dom) {

		var me = this,
			m  = new Matrix(context, dom);

		m.a = me.a + (m2.a - me.a) * t;
		m.b = me.b + (m2.b - me.b) * t;
		m.c = me.c + (m2.c - me.c) * t;
		m.d = me.d + (m2.d - me.d) * t;
		m.e = me.e + (m2.e - me.e) * t;
		m.f = me.f + (m2.f - me.f) * t;

		return m._x()
	},

	/**
	 * Interpolate this matrix with another and produce a new matrix.
	 * `t` is a value in the range [0.0, 1.0] where 0 is this instance and
	 * 1 is equal to the second matrix. The `t` value is not constrained.
	 *
	 * Context from parent matrix is not applied to the returned matrix.
	 *
	 * To obtain easing `t` can be preprocessed using easing-functions
	 * before being passed to this method.
	 *
	 * Note: this interpolation method uses decomposition which makes
	 * it suitable for animations (in particular where rotation takes
	 * places).
	 *
	 * @param {Matrix} m2 - the matrix to interpolate with.
	 * @param {number} t - interpolation [0.0, 1.0]
	 * @param {CanvasRenderingContext2D} [context] - optional context to affect
	 * @param {HTMLElement} [dom] - optional DOM element to use for the matrix
	 * @returns {Matrix} - new Matrix instance with the interpolated result
	 */
	interpolateAnim: function(m2, t, context, dom) {

		var m          = new Matrix(context, dom),
			d1         = this.decompose(),
			d2         = m2.decompose(),
			t1         = d1.translate,
			t2         = d2.translate,
			s1         = d1.scale;

		// QR order (t-r-s-sk)
		m.translate(t1.x + (t2.x - t1.x) * t, t1.y + (t2.y - t1.y) * t);
		m.rotate(d1.rotation + (d2.rotation - d1.rotation) * t);
		m.scale(s1.x + (d2.scale.x - s1.x) * t, s1.y + (d2.scale.y - s1.y) * t);
		//todo test skew scenarios

		return m._x()
	},

	/**
	 * Decompose the current matrix into simple transforms using either
	 * QR (default) or LU decomposition.
	 *
	 * @param {boolean} [useLU=false] - set to true to use LU rather than QR decomposition
	 * @returns {*} - an object containing current decomposed values (translate, rotation, scale, skew)
	 * @see {@link http://www.maths-informatique-jeux.com/blog/frederic/?post/2013/12/01/Decomposition-of-2D-transform-matrices|Adoption based on this code}
	 * @see {@link https://en.wikipedia.org/wiki/QR_decomposition|More on QR decomposition}
	 * @see {@link https://en.wikipedia.org/wiki/LU_decomposition|More on LU decomposition}
	 */
	decompose: function(useLU) {

		var me        = this,
			a         = me.a,
			b         = me.b,
			c         = me.c,
			d         = me.d,
			acos      = Math.acos,
			atan      = Math.atan,
			sqrt      = Math.sqrt,
			pi        = Math.PI,

			translate = {x: me.e, y: me.f},
			rotation  = 0,
			scale     = {x: 1, y: 1},
			skew      = {x: 0, y: 0},

			determ    = a * d - b * c;	// determinant(), skip DRY here...

		if (useLU) {
			if (a) {
				skew = {x: atan(c / a), y: atan(b / a)};
				scale = {x: a, y: determ / a};
			}
			else if (b) {
				rotation = pi * 0.5;
				scale = {x: b, y: determ / b};
				skew.x = atan(d / b);
			}
			else { // a = b = 0
				scale = {x: c, y: d};
				skew.x = pi * 0.25;
			}
		}
		else {
			// Apply the QR-like decomposition.
			if (a || b) {
				var r = sqrt(a * a + b * b);
				rotation = b > 0 ? acos(a / r) : -acos(a / r);
				scale = {x: r, y: determ / r};
				skew.x = atan((a * c + b * d) / (r * r));
			}
			else if (c || d) {
				var s = sqrt(c * c + d * d);
				rotation = pi * 0.5 - (d > 0 ? acos(-c / s) : -acos(c / s));
				scale = {x: determ / s, y: s};
				skew.y = atan((a * c + b * d) / (s * s));
			}
			else { // a = b = c = d = 0
				scale = {x: 0, y: 0};
			}
		}

		return {
			translate: translate,
			rotation : rotation,
			scale    : scale,
			skew     : skew
		}
	},

	/**
	 * Returns the determinant of the current matrix.
	 * @returns {number}
	 */
	determinant: function() {
		return this.a * this.d - this.b * this.c
	},

	/**
	 * Apply current matrix to `x` and `y` of a point.
	 * Returns a point object.
	 *
	 * @param {number} x - value for x
	 * @param {number} y - value for y
	 * @returns {{x: number, y: number}} A new transformed point object
	 */
	applyToPoint: function(x, y) {

		var me = this;

		return {
			x: x * me.a + y * me.c + me.e,
			y: x * me.b + y * me.d + me.f
		}
	},

	/**
	 * Apply current matrix to array with point objects or point pairs.
	 * Returns a new array with points in the same format as the input array.
	 *
	 * A point object is an object literal:
	 *
	 *     {x: x, y: y}
	 *
	 * so an array would contain either:
	 *
	 *     [{x: x1, y: y1}, {x: x2, y: y2}, ... {x: xn, y: yn}]
	 *
	 * or
	 *
	 *     [x1, y1, x2, y2, ... xn, yn]
	 *
	 * @param {Array} points - array with point objects or pairs
	 * @returns {Array} A new array with transformed points
	 */
	applyToArray: function(points) {

		var i = 0, p, l,
			mxPoints = [];

		if (typeof points[0] === 'number') {

			l = points.length;

			while(i < l) {
				p = this.applyToPoint(points[i++], points[i++]);
				mxPoints.push(p.x, p.y);
			}
		}
		else {
			while(p = points[i++]) {
				mxPoints.push(this.applyToPoint(p.x, p.y));
			}
		}

		return mxPoints
	},

	/**
	 * Apply current matrix to a typed array with point pairs. Although
	 * the input array may be an ordinary array, this method is intended
	 * for more performant use where typed arrays are used. The returned
	 * array is regardless always returned as a `Float32Array`.
	 *
	 * @param {*} points - (typed) array with point pairs [x1, y1, ..., xn, yn]
	 * @param {boolean} [use64=false] - use Float64Array instead of Float32Array
	 * @returns {*} A new typed array with transformed points
	 */
	applyToTypedArray: function(points, use64) {

		var i = 0, p,
			l = points.length,
			mxPoints = use64 ? new Float64Array(l) : new Float32Array(l);

		while(i < l) {
			p = this.applyToPoint(points[i], points[i + 1]);
			mxPoints[i++] = p.x;
			mxPoints[i++] = p.y;
		}

		return mxPoints
	},

	/**
	 * Apply to any canvas 2D context object. This does not affect the
	 * context that optionally was referenced in constructor unless it is
	 * the same context.
	 *
	 * @param {CanvasRenderingContext2D} context - target context
	 * @returns {Matrix}
	 */
	applyToContext: function(context) {
		var me = this;
		context.setTransform(me.a, me.b, me.c, me.d, me.e, me.f);
		return me
	},

	/**
	 * Apply to any DOM element. This does not affect the DOM element
	 * that optionally was referenced in constructor unless it is
	 * the same element.
	 *
	 * The method will auto-detect the correct browser prefix if any.
	 *
	 * @param {HTMLElement} element - target DOM element
	 * @param {boolean} [use3D=false] - use 3D transformation matrix instead of 2D
	 * @returns {Matrix}
	 */
	applyToElement: function(element, use3D) {
		var me = this;
		if (!me._px) me._px = me._getPX();
		element.style[me._px] = use3D ? me.toCSS3D() : me.toCSS();
		return me
	},

	/**
	 * Instead of creating a new instance of a Matrix, DOMMatrix or SVGMatrix
	 * the current settings of this instance can be applied to an external
	 * object of a different (or same) type. You can also pass in an
	 * empty literal object.
	 *
	 * Note that the properties a-f will be set regardless of if they
	 * already exist or not.
	 *
	 * @param {*} obj - target object.
	 * @returns {Matrix}
	 */
	applyToObject: function(obj) {
		var me = this;
		obj.a = me.a;
		obj.b = me.b;
		obj.c = me.c;
		obj.d = me.d;
		obj.e = me.e;
		obj.f = me.f;
		return me
	},

	/**
	 * Returns true if matrix is an identity matrix (no transforms applied).
	 * @returns {boolean}
	 */
	isIdentity: function() {
		var me = this;
		return me._q(me.a, 1) &&
			me._q(me.b, 0) &&
			me._q(me.c, 0) &&
			me._q(me.d, 1) &&
			me._q(me.e, 0) &&
			me._q(me.f, 0)
	},

	/**
	 * Returns true if matrix is invertible
	 * @returns {boolean}
	 */
	isInvertible: function() {
		return !this._q(this.determinant(), 0)
	},

	/**
	 * The method is intended for situations where scale is accumulated
	 * via multiplications, to detect situations where scale becomes
	 * "trapped" with a value of zero. And in which case scale must be
	 * set explicitly to a non-zero value.
	 *
	 * @returns {boolean}
	 */
	isValid: function() {
		return !(this.a * this.d)
	},

	/**
	 * Compares current matrix with another matrix. Returns true if equal
	 * (within epsilon tolerance).
	 * @param {Matrix|SVGMatrix} m - matrix to compare this matrix with
	 * @returns {boolean}
	 */
	isEqual: function(m) {

		var me = this,
			q = me._q;

		return  q(me.a, m.a) &&
				q(me.b, m.b) &&
				q(me.c, m.c) &&
				q(me.d, m.d) &&
				q(me.e, m.e) &&
				q(me.f, m.f)
	},

	/**
	 * Clones current instance and returning a new matrix.
	 * @param {boolean} [noContext=false] don't clone context reference if true
	 * @returns {Matrix} - a new Matrix instance with identical transformations as this instance
	 */
	clone: function(noContext) {
		return new Matrix(noContext ? null : this.context).multiply(this)
	},

	/**
	 * Returns an array with current matrix values.
	 * @returns {Array}
	 */
	toArray: function() {
		var me = this;
		return [me.a, me.b, me.c, me.d, me.e, me.f]
	},

	/**
	 * Returns a binary typed array, either as 32-bit (default) or
	 * 64-bit.
	 * @param {boolean} [use64=false] chose whether to use 32-bit or 64-bit typed array
	 * @returns {*}
	 */
	toTypedArray: function(use64) {

		var a  = use64 ? new Float64Array(6) : new Float32Array(6),
			me = this;

		a[0] = me.a;
		a[1] = me.b;
		a[2] = me.c;
		a[3] = me.d;
		a[4] = me.e;
		a[5] = me.f;

		return a
	},

	/**
	 * Generates a string that can be used with CSS `transform`.
	 * @example
	 *     element.style.transform = m.toCSS();
	 * @returns {string}
	 */
	toCSS: function() {
		return "matrix(" + this.toArray() + ")"
	},

	/**
	 * Generates a `matrix3d()` string that can be used with CSS `transform`.
	 * Although the matrix is for 2D use you may see performance benefits
	 * on some devices using a 3D CSS transform instead of a 2D.
	 * @example
	 *     element.style.transform = m.toCSS3D();
	 * @returns {string}
	 */
	toCSS3D: function() {
		var me = this;
		return "matrix3d(" + me.a + "," + me.b + ",0,0," + me.c + "," + me.d + ",0,0,0,0,1,0," + me.e + "," + me.f + ",0,1)"
	},

	/**
	 * Returns a JSON compatible string of current matrix.
	 * @returns {string}
	 */
	toJSON: function() {
		var me = this;
		return '{"a":' + me.a + ',"b":' + me.b + ',"c":' + me.c + ',"d":' + me.d + ',"e":' + me.e + ',"f":' + me.f + '}'
	},

	/**
	 * Returns a string with current matrix as comma-separated list.
	 * @param {number} [fixLen=4] - truncate decimal values to number of digits
	 * @returns {string}
	 */
	toString: function(fixLen) {
		var me = this;
		fixLen = fixLen || 4;
		return 	 "a=" + me.a.toFixed(fixLen) +
				" b=" + me.b.toFixed(fixLen) +
				" c=" + me.c.toFixed(fixLen) +
				" d=" + me.d.toFixed(fixLen) +
				" e=" + me.e.toFixed(fixLen) +
				" f=" + me.f.toFixed(fixLen)
	},

	/**
	 * Returns a string with current matrix as comma-separated values
	 * string with line-end (CR+LF).
	 * @returns {string}
	 */
	toCSV: function() {
		return this.toArray().join() + "\r\n"
	},

	/**
	 * Convert current matrix into a `DOMMatrix`. If `DOMMatrix` is not
	 * supported, a `null` is returned.
	 *
	 * @returns {DOMMatrix}
	 * @see {@link https://drafts.fxtf.org/geometry/#dommatrix|MDN / SVGMatrix}
	 */
	toDOMMatrix: function() {
		var m = null;
		if ("DOMMatrix" in window) {
			m = new DOMMatrix();
			m.a = this.a;
			m.b = this.b;
			m.c = this.c;
			m.d = this.d;
			m.e = this.e;
			m.f = this.f;
		}
		return m
	},

	/**
	 * Convert current matrix into a `SVGMatrix`. If `SVGMatrix` is not
	 * supported, a `null` is returned.
	 *
	 * @returns {SVGMatrix}
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/SVGMatrix|MDN / SVGMatrix}
	 */
	toSVGMatrix: function() {

		var	me = this,
			svg = document.createElementNS("http://www.w3.org/2000/svg", "svg"),
			svgMatrix = null;

		if (svg) {
			svgMatrix = svg.createSVGMatrix();
			svgMatrix.a = me.a;
			svgMatrix.b = me.b;
			svgMatrix.c = me.c;
			svgMatrix.d = me.d;
			svgMatrix.e = me.e;
			svgMatrix.f = me.f;
		}

		return svgMatrix
	},

	/**
	 * Compares floating point values with some tolerance (epsilon)
	 * @param {number} f1 - float 1
	 * @param {number} f2 - float 2
	 * @returns {boolean}
	 * @private
	 */
	_q: function(f1, f2) {
		return Math.abs(f1 - f2) < 1e-14
	},

	/**
	 * Apply current absolute matrix to context if defined, to sync it.
	 * Apply current absolute matrix to element if defined, to sync it.
	 * @returns {Matrix}
	 * @private
	 */
	_x: function() {

		var me = this;

		if (me.context)
			me.context.setTransform(me.a, me.b, me.c, me.d, me.e, me.f);

		if (me._st)
			me._st[me._px] = me.useCSS3D ? me.toCSS3D() : me.toCSS();	// can be optimized pre-storing func ref.

		return me
	}
};

// Node support
if (true) exports.Matrix = Matrix;


/***/ })
/******/ ]);
});