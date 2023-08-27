# AsciiGL

## A text-based Graphics Library written in JavaScript!

***

### What is AsciiGL?

It's exactly what the subtitle says!

### What can AsciiGL do?

AsciiGL can currently draw 5 graphics primitives. These are:

*   Point
*   Line
*   Rectangle
*   Circle
*   Text

You can even specify the stroke fill characters!

It can also handle basic keyboard input!

PLEASE NOTE: At the moment, AsciiGL does run poorly on slower devices, optimizations will come soon!

# Documentation

***

## Getting Started

To create a new instance of AsciiGL, add the following HTML to the head of your
html file:

```javascript
<script src="./path/to/asciigl.js">
```

Make sure to use the path of where AsciiGL is located.

Then add the following to the body of your html document:

```javascript
<div id="render">
<script>
    ctx = new AsciiGLContext("render", 50, 30)
<script>
```

Now you have an instance of AsciiGL! It's blank, so you have to actually add things

## API Reference

### Configuration

AsciiGLContext.doautoupdate --- If set to true, will automatically refresh textarea when a drawing function is called.

AsciiGLContext.primitives.stroke --- The Ascii Character to use when stroking (use ascii number, not text)

AsciiGLContext.primitives.fill --- The Ascii Character to use when filling (use ascii number, not text)

### Drawing

AsciiGLContext.update() --- refreshes textarea&#x20;

AsciiGLContext.primitives.point(x, y) --- Draws the stroke character at (x, y)

AsciiGLContext.primitives.line(x, y, ex, ey) --- Draws a line from (x, y) to (ex, ey) with stroke character

AsciiGLContext.primitives.rect(x, y, w, h) ---- Draws a rectangle at (x, y) with width w and height h. Outline is stroke character, and is filled with fill character.

AsciiGLContext.primitives.circle(x, y, r) --- Draws a circle at (x, y) with a radius of w. Outline is stroke character, and is filled with fill character.

AsciiGLContext.primitives.text(x, y, string) --- Draws string at (x, y)

AsciiGLContext.input.getKey(code) --- Checks if key (KeyboardEvent Code) is down.

AsciiGLContext.input.onkeydown() --- Called on keydown. Meant to be redefined by user.

AsciiGLContext.input.onkeyup() --- Called on keyup. Meant to be redefined by user.
