const Matrix = require("transformation-matrix-js").Matrix;

function lastElement(array) {
    return array[array.length - 1];
}

module.exports = class Context2DTracked {
    constructor(target) {
        // use: const ctx = new Context2DTracked(canvas.getContext("2d"));
        // target is Canvas Context2D that will be wrapped and tracked
        this.context = target;

        this.tf = [new Matrix(target)];  // keep track of transformations

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


        const deprecatedProperties = ['webkitImageSmoothingEnabled'];
        // "inherit" methods and properties from Context
        const origProps = Object.getOwnPropertyNames(target.__proto__);
        for (let i = 0; i < origProps.length; i++) {
            let p = origProps[i];
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
     * Print crosshairs at the current pen location and return their locations
     */
    trace() {
        const x = this.penx, y = this.peny;
        console.log(Math.round(x * 10) / 10 + this.ox, Math.round(y * 10) / 10 + this.oy);
        // assume path
        // has begun
        this.context.moveTo(x - 5, y);
        this.context.lineTo(x + 5, y);
        this.context.moveTo(x, y + 5);
        this.context.lineTo(x, y - 5);
        this.context.moveTo(x, y);
        return {x,y};
    };

    /**
     * Transforms a point in base coordinates to context coordinates by applying the transforms the context went through
     * @param x
     * @param y
     * @returns {*|{x, y}|{x: number, y: number}}
     */
    transformPoint(x, y) {
        // transforms a point into context coordinates
        const invtf = lastElement(this.tf).inverse();
        return invtf.applyToPoint(x, y);
    }

    transformCoordinate(x, y) {
        // transform context coordinates into a point
        return lastElement(this.tf).applyToPoint(x, y);
    }

    // wrapping around existing methods
    // transformation handling
    save() {
        this.tf.push(lastElement(this.tf).clone());
        this.context.save();
    }

    restore() {
        this.tf.pop();
        this.context.restore();
    }

    scale(x, y) {
        lastElement(this.tf).scale(x, y);
    }

    translate(x, y) {
        lastElement(this.tf).translate(x, y);
    }

    setTransform(a, b, c, d, e, f) {
        lastElement(this.tf).setTransform(a, b, c, d, e, f);
    }

    rotate(angle) {
        lastElement(this.tf).rotate(angle);
    }

    movePen(x, y) {
        if (this.justBegun) {
            this.justBegun = false;
            this.bpenx = x;
            this.bpeny = y;
        }
        this.penx = x;
        this.peny = y;
    }

    // methods that change pen position will be overriden
    beginPath() {
        this.justBegun = true;
        this.context.beginPath();
    }

    moveTo(x, y) {
        this.movePen(x, y);
        this.context.moveTo(x, y);
    }

    lineTo(x, y, debugOptions) {
        if (debugOptions || this.showcontrol) {
            const options = Object.assign(this._getDefaultDebugOptions(), debugOptions);
            this._drawCurveControl(this._getDebugPoint(x, y), options);
        }
        this.context.lineTo(x, y);
        this.movePen(x, y);
    }


    bezierCurveTo(cpx1, cpy1, cpx2, cpy2, x, y, debugOptions) {
        if (debugOptions || this.showcontrol) {
            const options = Object.assign(this._getDefaultDebugOptions(), debugOptions);
            this._drawCurveControl(this._getDebugPoint(x, y, cpx1, cpy1, cpx2, cpy2), options);
        }
        // rest of curve
        this.context.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, x, y);
        this.movePen(x, y);
    }

    quadraticCurveTo(cpx, cpy, x, y, debugOptions) {
        if (debugOptions || this.showcontrol) {
            const options = Object.assign(this._getDefaultDebugOptions(), debugOptions);
            this._drawCurveControl(this._getDebugPoint(x, y, cpx, cpy), options);
        }
        // rest of curve
        this.context.quadraticCurveTo(cpx, cpy, x, y);
        this.movePen(x, y);
    }

    arc(x, y, radius, startAngle, endAngle, anticlockwise) {
        // first move to starting location
        // using a bit of trig
        const sx = x + Math.cos(startAngle) * radius, sy = y + Math.sin(startAngle) * radius;
        this.movePen(sx, sy);
        // draw arc
        this.context.arc(x, y, radius, startAngle, endAngle, anticlockwise);

        const ex = x + Math.cos(endAngle) * radius, ey = y + Math.sin(endAngle) * radius;
        this.movePen(ex, ey);
        // bug? fills to the start of the
        // path, but the continuation for
        // the next part of the line is
        // actually the end point
        this.bpenx = ex;
        this.bpeny = ey;
    }

    ellipse(x, y, rx, ry, rot, sa, ea, anticlockwise) {
        if (this.context.ellipse) {
            this.context.ellipse.apply(this.context, arguments);
        } else {
            // polyfill
            this.save();
            this.translate(x, y);
            this.rotate(rot);
            this.scale(rx, ry);
            this.arc(0, 0, 1, sa, ea, anticlockwise);
            this.restore();
        }
    }

    arcTo(x1, y1, x2, y2, radius) {
        // Don't use this please; no
        // idea how to calculate the
        // ending location...
        this.context.arcTo(x1, y1, x2, y2, radius);
    }

    stroke() {
        if (this.context.strokeStyle !== "rgba(0, 0, 0, 0)") {
            this.context.stroke();
        }
    }

    // fill always draws straight
    // line to point starting the
    // path
    fill() {
        this.movePen(this.bpenx, this.bpeny);
        this.context.fill.apply(this.context, arguments);
    }

    clip() {
        this.movePen(this.bpenx, this.bpeny);
        this.context.clip.apply(this.context, arguments);
    }


    // new utility methods
    _drawCurveControl(point, style) {
        this.context.save();
        // assume path
        // has already
        // begun

        const ptprint = [point.p1];
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
        for (let i = 0; i < ptprint.length; ++i) {
            const p = ptprint[i];
            ptprint[i] = "(" + Math.round(ptprint[i].x * 10) / 10 + ", " +
                Math.round(ptprint[i].y * 10) / 10 + ")";
            this.context.lineWidth = style.point.width;
            // use different colour for destination colour
            if (p === point.p2) {
                this.context.strokeStyle = style.point.destinationColor;
            } else {
                this.context.strokeStyle = style.point.color;
            }
            this.context.fillStyle = style.point.fill;
            this.context.beginPath();
            this.context.arc(p.x, p.y, style.point.radius, 0, 2 * Math.PI, true)

            this.context.fill();
            // target.font = style.point.radius * 4 + "px arial";
            // target.fillStyle = "black";
            // target.fillText(i + 1, p.x, p.y + style.point.radius * 5);
            this.context.stroke();
        }
        console.log("from points", ptprint.join(" to "));

        this.context.restore();
        this.context.beginPath();  // return to
        // previously
        // open path
        this.context.moveTo(point.p1.x, point.p1.y);
    };

    _getDebugPoint(x, y, cpx1, cpy1, cpx2, cpy2) {
        const point = {
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
            point.cp1 =
            {
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

    _getDefaultDebugOptions() {
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
            },
        };
    }
};

