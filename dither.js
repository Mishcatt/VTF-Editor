// The standard 4x4 (64 pixel) dithering matrix

var dither = [
    [0, 0, 0, 0,
     0, 0, 0, 0,
     0, 0, 0, 0,
     0, 0, 0, 0],
    [1, 0, 0, 0,
     0, 0, 0, 0,
     0, 0, 0, 0,
     0, 0, 0, 0],
    [1, 0, 0, 0,
     0, 0, 0, 0,
     0, 0, 1, 0,
     0, 0, 0, 0],
    [1, 0, 1, 0,
     0, 0, 0, 0,
     0, 0, 1, 0,
     0, 0, 0, 0],
    [1, 0, 1, 0,
     0, 0, 0, 0,
     1, 0, 1, 0,
     0, 0, 0, 0],
    [1, 0, 1, 0,
     0, 1, 0, 0,
     1, 0, 1, 0,
     0, 0, 0, 0],
    [1, 0, 1, 0,
     0, 1, 0, 0,
     1, 0, 1, 0,
     0, 0, 0, 1],
    [1, 0, 1, 0,
     0, 1, 0, 1,
     1, 0, 1, 0,
     0, 0, 0, 1],
    [1, 0, 1, 0,
     0, 1, 0, 1,
     1, 0, 1, 0,
     0, 1, 0, 1],
    [1, 1, 1, 0,
     0, 1, 0, 1,
     1, 0, 1, 0,
     0, 1, 0, 1],
    [1, 1, 1, 0,
     0, 1, 0, 1,
     1, 0, 1, 1,
     0, 1, 0, 1],
    [1, 1, 1, 1,
     0, 1, 0, 1,
     1, 0, 1, 1,
     0, 1, 0, 1],
    [1, 1, 1, 1,
     0, 1, 0, 1,
     1, 1, 1, 1,
     0, 1, 0, 1],
    [1, 1, 1, 1,
     1, 1, 0, 1,
     1, 1, 1, 1,
     0, 1, 0, 1],
    [1, 1, 1, 1,
     1, 1, 0, 1,
     1, 1, 1, 1,
     0, 1, 1, 1],
    [1, 1, 1, 1,
     1, 1, 1, 1,
     1, 1, 1, 1,
     0, 1, 1, 1],
    [1, 1, 1, 1,
     1, 1, 1, 1,
     1, 1, 1, 1,
     1, 1, 1, 1]
];

// Get the state of any coordinate from a dithering matrix

function getDither(matrix, x, y) {
    return matrix[((y % 4) * 4) + (x % 4)];
}

// Gets the color in the palette which best matches the given color

function bestMatch(palette, color) {
    var best = [Infinity, [0, 0, 0]];
    for (var i = 0; i < palette.length; i += 1) {
        if (!colorSqrt)
            var difference = Math.abs(palette[i][0] - color[0]) + Math.abs(palette[i][1] - color[1]) + Math.abs(palette[i][2] - color[2]);
        else
            var difference = Math.abs(Math.sqrt(palette[i][0]/255) - Math.sqrt(color[0]/255)) + 
            Math.abs(Math.sqrt(palette[i][1]/255) - Math.sqrt(color[1]/255)) + 
            Math.abs(Math.sqrt(palette[i][2]/255) - Math.sqrt(color[2]/255));
        if (difference < best[0]) {
            best = [difference, palette[i]];
        }
    }
    return best[1];
}

function bestMatchIndex(palette, color) {
    var best = [Infinity, [0, 0, 0]];
    for (var i = 0; i < palette.length; i += 1) {
        if (colorDifference == 1){
            var luma1 = getLuminance(color[0], color[1], color[2]);
            var luma2 = getLuminance(palette[i][0], palette[i][1], palette[i][2]);
            var difference = Math.abs(luma1 - luma2);
        }
        else if (!colorSqrt)
            var difference = Math.abs(palette[i][0] - color[0]) + Math.abs(palette[i][1] - color[1]) + Math.abs(palette[i][2] - color[2]);
        else
            var difference = Math.abs(Math.sqrt(palette[i][0]/255) - Math.sqrt(color[0]/255)) + 
            Math.abs(Math.sqrt(palette[i][1]/255) - Math.sqrt(color[1]/255)) + 
            Math.abs(Math.sqrt(palette[i][2]/255) - Math.sqrt(color[2]/255));
        if (difference < best[0]) {
            best = [difference, i];
        }
    }
    return best;
}

// Same as above, except excluding the color in the palette at the specified index

function bestMatchEx(palette, color, index) {
    var best = [Infinity, [0, 0, 0]];
    for (var i = 0; i < palette.length; i += 1) {
        if (i == index) {continue;}
        var difference = Math.abs(palette[i][0] - color[0]) + Math.abs(palette[i][1] - color[1]) + Math.abs(palette[i][2] - color[2]);
        if (difference < best[0]) {
            best = [difference, palette[i]];
        }
    }
    return best;
}

function bestMatchExIndex(palette, color, index) {
    var best = [Infinity, [0, 0, 0]];
    for (var i = 0; i < palette.length; i += 1) {
        if (i == index) {continue;}
        if (colorDifference == 1){
            var luma1 = (0.2126*color[0])+(0.7152*color[1])+(0.0722*color[2]);
            var luma2 = (0.2126*palette[i][0])+(0.7152*palette[i][1])+(0.0722*palette[i][2]);
            var difference = Math.abs(luma1 - luma2);
        }
        else if (!colorSqrt)
            var difference = Math.abs(palette[i][0] - color[0]) + Math.abs(palette[i][1] - color[1]) + Math.abs(palette[i][2] - color[2]);
        else
            var difference = Math.abs(Math.sqrt(palette[i][0]/255) - Math.sqrt(color[0]/255)) + 
            Math.abs(Math.sqrt(palette[i][1]/255) - Math.sqrt(color[1]/255)) + 
            Math.abs(Math.sqrt(palette[i][2]/255) - Math.sqrt(color[2]/255));
        if (difference < best[0]) {
            best = [difference, i];
        }
    }
    return best;
}
// Divides all components of a color by a given factor

function divideColor(color, factor) {
    return [color[0] / factor, color[1] / factor, color[2] / factor];
}

// Multiplies all components of a color by a given factor

function multiplyColor(color, factor) {
    return [color[0] * factor, color[1] * factor, color[2] * factor];
}

// Adds two colors together by adding their components

function addColor(a, b) {
    return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}