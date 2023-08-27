//AsciiGL Context Class
class AsciiGLContext {
    //Some variables
    ctx = null; //The textarea for AsciiGL
    buffer = null; //The text buffer
    doautoupdate = true; //Do Auto Update (refreshes after drawing something automatically)
    width = 0; //Width (changing this doesn't change textarea size, but will mess up math.)
    height = 0; //Height (changing this doesn't change textarea size, but will mess up math.)

    primitives = null; //Reference to primitives class
    input = null; //Reference to input class

    //divid - where to place the AsciiGL TextArea
    //w - how wide to make the TextArea (characters)
    //h - how tall to make the TextArea (characters)
    constructor(divid, w, h) {
        //Creates AsciiGL TextArea

        let aglh = document.getElementById(divid);

        this.ctx = document.createElement("textarea");
        this.ctx.setAttribute("id", "asciigl");
        this.ctx.setAttribute("rows", h + 1);
        this.ctx.setAttribute("cols", w);
        this.ctx.setAttribute("readonly", "true");
        this.ctx.setAttribute("style", "font-family:monospace; resize: none; font-size: 10px;");

        //Sets some variables
        this.width = w;
        this.height = h;

        //Creates text buffer
        this.buffer = new Array(w*h).fill(0);

        this.primitives = new AsciiGLPrimitives(this); //Creates new primitives class
        this.input = new AsciiGLInput(this); //Creates new input class

        //Adds new element to the div
        aglh.appendChild(this.ctx);
        this.update();
    }

    //Simple function that is called by all drawing functions
    //to check whether or not to automatically draw
    autoupdate = function() {
        if(this.doautoupdate) {
            this.update();
        }
    }

    //Simple update function that outputs contents of the text buffer
    //to the AsciiGL TextArea
    update = function() {
        let buf = "";
        let index = 0;
        for(let i = 0; i<this.height; i++) {
            for(let e = 0; e<this.width; e++) {
                buf += ascii[this.buffer[index]];
                index+=1;
            }
            buf+="\n";
        }
        this.ctx.innerHTML = buf;
    }

    //Clears text buffer
    clear = function() {
        this.buffer = this.buffer.fill(0);
        this.autoupdate();
    }
}


//AsciiGL Primitaves Class
class AsciiGLPrimitives {
    //Some variables
    agl = null; //Reference to the AsciiGL Context
    stroke = 88; //Stroke (ascii character)
    fill = 45; //Fill (ascii character)

    //Sets reference to the context
    constructor(ctx) {
        this.agl = ctx;
    }

    //_point but with autoupdate and stroke
    point = function(x, y, c) {
        this._point(x, y, this.stroke);
        this.agl.autoupdate();
    }

    //Calculates where on the text buffer is x and y and puts c in that index.
    _point = function(x, y, c) {
        if(x >=0 && x < this.agl.width && y >=0 && y < this.agl.height) {
            let i = x + this.agl.width*y;
            this.agl.buffer[i] = c;
        }
    }

    //_line but with autoupdate and stroke
    line = function(x1, y1, x2, y2) {
        this._line(x1, y1, x2, y2, this.stroke)
        this.agl.autoupdate();
    }

    //Draws a line from (x1, y1) to (x2, y2) with ascii character c
    //I can't explain how it works because even I don't know how it works.... sorry...
    _line = function(x1, y1, x2, y2, c) {
        x1 = Math.round(x1);
        y1 = Math.round(y1);
        x2 = Math.round(x2);
        y2 = Math.round(y2);
        const dx = Math.abs(x2 - x1);
        const sx = x1 < x2 ? 1 : -1;
        const dy = -Math.abs(y2 - y1);
        const sy = y1 < y2 ? 1 : -1;
        var e2, er = dx + dy, end = false;
        while (!end) {
            this._point(x1, y1, c);
            if (x1 === x2 && y1 === y2) {
                end = true;
            } else {
                e2 = 2 * er;
                if (e2 > dy) {
                    er += dy;
                    x1 += sx;
                }
                if (e2 < dx) {
                    er += dx;
                    y1 += sy;
                }
            }
        }
    }

    //Draws a rectangle at (x, y) with the width of w and height of h
    rect = function(x, y, w, h) {
        //offsets w by x and h by y
        w = x + w;
        h = y + h;

        //Outlines rectangle
        this._line(x, y, w, y, this.stroke);
        this._line(w, y, w, h, this.stroke);
        this._line(x, h, w, h, this.stroke);
        this._line(x, y, x, h, this.stroke);

        //Fills in rectangle
        for(let fy = y+1; fy<h; fy++) {
            this._line(x+1, fy, w-1, fy, this.fill);
        }

        this.agl.autoupdate();
    }


    //Draws a rectangle (from top-left to bottom-right) at (xc, yc) with a radius of r.
    //I can ***kind of*** explain this one
    circle = function(xc, yc, r) {
        //Offsets by radius (so it doesn't draw from center)
        xc += r;
        yc += r;

        var x = r, y = 0, cd = 0;


        //Draws points at the top-center, bottom-center, center-left, and center-right
        this._point(xc - x, yc, this.stroke);
        this._point(xc + x, yc, this.stroke);

        this._point(xc, yc + x, this.stroke);
        this._point(xc, yc - x, this.stroke);

        //midline
        this._line(xc - x + 1, yc, xc + x - 1, yc, this.fill);

        while (x > y) {
            cd -= (--x) - (++y);
            if (cd < 0) cd += x++;
            this._point(xc - y, yc - x, this.stroke);    // upper 1/4
            this._point(xc - x, yc - y, this.stroke);    // upper 2/4
            this._point(xc - x, yc + y, this.stroke);    // lower 3/4
            this._point(xc - y, yc + x, this.stroke);    // lower 4/4
            
            this._point(xc + y, yc + x, this.stroke);    // upper 1/4
            this._point(xc + x, yc + y, this.stroke);    // upper 2/4
            this._point(xc + x, yc - y, this.stroke);    // lower 3/4
            this._point(xc + y, yc - x, this.stroke);    // lower 4/4

            this._line(xc - x + 1, yc - y, xc + x - 1, yc - y, this.fill); // fill mid-top quarter
            this._line(xc - x + 1, yc + y, xc + x - 1, yc + y, this.fill); // fill mid-bottom quarter

            this._line(xc - y, yc - x + 1, xc + y, yc - x + 1, this.fill) // fill top quarter
            this._line(xc - y, yc + x - 1, xc + y, yc + x - 1, this.fill) // fill bottom quarter

        }

        this.agl.autoupdate();
    }

    //Draws txt at (x, y)
    //Pretty much, it loops through txt, and it keeps drawing each character as a point
    //and goes horizontally.
    text = function(x, y, txt) {
        for(let i=0; i<txt.length; i++) {
            let t = ascii.indexOf(txt[i]);
            if(t == -1) { t = 0; }
            this._point(x+i, y, t);
        }
        this.agl.autoupdate();
    }
}

//ASCII table.
ascii = [
    ' ',' ',' ',' ',' ',' ',' ',' ',
    ' ',' ',' ',' ',' ',' ',' ',' ',
    ' ',' ',' ',' ',' ',' ',' ',' ',
    ' ',' ',' ',' ',' ',' ',' ',' ',
    ' ', '!', '"', '#', '$', '%', '&', '\'',
    '(', ')', '*', '+', ',', '-', '.', '/',
    '0', '1', '2', '3', '4', '5', '6', '7',
    '8', '9', ':', ';', '<', '=', '>', '?',
    '@', 'A', 'B', 'C', 'D', 'E', 'F', 'G',
    'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O',
    'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W',
    'X', 'Y', 'Z', '[', '\\' ,']', '^', '_',
    '`', 'a', 'b', 'c', 'd', 'e', 'f', 'g',
    'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o',
    'p', 'q', 'r', 's', 't', 'u', 'v', 'w',
    'x', 'y', 'z', '{', '|', '}', '~', ' '
];

//AsciiGL Input

//AsciiGL Input KeyCodes
class AsciiGLInput {
    agl = null; //Reference to AsciiGLContext
    _keys = []; //Contains all keys that are pressed

    //Adds event listener to AsciiGL Context
    constructor(ctx) {
        this.agl = ctx
        this.agl.ctx.addEventListener("keydown", e => this._setKey(e, this));
        this.agl.ctx.addEventListener("keyup", e => this._unSetKey(e, this));
    }

    //Sets key array variable if key is down
    _setKey = function(e, th) {
        if(!th._keys.includes(e.code)) {
            th._keys.push(e.code);
            th.onkeydown();
        }
    }

    //Sets key array variable if key is up
    _unSetKey = function(e, th) {
        if(th._keys.includes(e.code)) {
            th._keys = th._keys.filter((kc) => { return kc != e.code})
            th.onkeyup();
        }
    }

    //Checks if key is down (using JS Keyboard Event Code)
    getKey = function(keycode) {
        return this._keys.includes(keycode);
    }

    //Called on keydown, meant to be re-definable by user.
    onkeydown = function() {

    }

    //Called on keyup, meant to be re-definable by user.
    onkeyup = function() {

    }
}