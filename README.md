# 2D Drawing Context with tracked pen movement and transforms
A simple wrapper around CanvasRenderingContext2D in browsers
for debugging purposes and to retrieve the inverse transform.

## Usage
Get by cloning the repository (npm install not recommended).
### building
```bash
npm install
npm run build
```
This creates `dist/Context2DTracked.js` file that you'll need to include
in a script tag.

See demo in test/index.html
### initialization
```html
<html>
<head>
    <meta charset="UTF-8">
    <script src="./Context2DTracked.js"></script>
</head>
<body>
<canvas id="cv" width="600" height="600" style="border:solid black 2px"></canvas>
<script>
const cv = document.getElementById("cv");

// can use just as a global variable in the browser
const ctx = new Context2DTracked(cv.getContext("2d"));
</script>
</body>
</html>
```

### trace
Print a crosshair where the pen is currently at and return the coordinates.
```javascript
ctx.beginPath();
ctx.moveTo(20,25);
ctx.bezierCurveTo(100,200,200,100,350,400);
ctx.trace();    // print
ctx.stroke(); 
```

### control points
Show the control points of bezier and quadratic curves by passing in 
an extra argument that's non-false to the drawing methods.
```javascript
ctx.beginPath();
ctx.moveTo(20,25);
ctx.bezierCurveTo(100,200,200,100,350,400, true);
ctx.stroke(); 
```

### transform points
Transform points in canvas coordinate to context coordinate.
Initially, the two are the same, but after for example `ctx.scale(2,2)` canvas
coordinates `(100, 100)` (i.e. 100 pixels right and 100 pixels down from 
the canvas' top left corner) becomes `(50,50)` in context coordinates.
```javascript
canvas.addEventListener("click", function(e){
    e.preventDefault();
    var x;
    var y;
    if (e.pageX || e.pageY) {
        x = e.pageX;
        y = e.pageY;
    } else {
        x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }
    x -= cv.offsetLeft;
    y -= cv.offsetTop;

    console.log("canvas coordinates:  ", x, y);
    var pt = ctx.transformPoint(x, y);
    console.log("context coordinates: ", pt.x, pt.y);
});
```