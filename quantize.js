// Quantize image using median cut

// Convert raw color data to an pixel array

function rawToArray(raw) {
    var out = [];
    for (var i = 0; i < raw.length; i += 4) {
        out.push([raw[i], raw[i + 1], raw[i + 2]]);
    }
    return out;
}

// Check if a number is a power of two

function powTwo(n) {
    return n && (n & (n - 1)) === 0;
}

// Find the greatest color channel range in an array of pixels

function greatestColorChannel(pixels) {
    var sums = [0, 0, 0];
    for (var i = 0; i < pixels.length; i += 1) {
        sums[0] += pixels[i][0];
        sums[1] += pixels[i][1];
        sums[2] += pixels[i][2];
    }
    if (sums[0] > sums[1]) {
        if (sums[0] > sums[2]) {
            return 0;
        } else {
            return 2;
        }
    } else {
        if (sums[1] > sums[2]) {
            return 1;
        } else {
            return 2;
        }
    }
}

// Sort array by colors with greatest value in a specified channel

function sortByChannel(pixels, channel) {
    var comparison = function(a, b) {
        return a[channel] - b[channel];
    }
    return pixels.sort(comparison);
}

// Split a pixel array in half and return the halves

function halfPixels(pixels) {
    var half1;
    var half2 = pixels;
    half1 = half2.splice(0, Math.ceil(half2.length / 2));
    return [half1, half2];
}

// Get average color from an array of pixels

function averagePixels(pixels) {
    var sums = [0, 0, 0];
    for (var i = 0; i < pixels.length; i += 1) {
        sums[0] += pixels[i][0];
        sums[1] += pixels[i][1];
        sums[2] += pixels[i][2];
    }
    return [sums[0] / pixels.length, sums[1] / pixels.length, sums[2] / pixels.length];
}

// Find n in 2^n = x

function findExponent(x) {
    var i = 0;
    do {
        i += 1;
    } while (Math.pow(2, i) != x);
    return i;
}

// Make a palette from an array of pixel arrays by averaging each pixel array

function makePalette(buckets) {
    var palette = [];
    for (var i = 0; i < buckets.length; i += 1) {
        palette.push(averagePixels(buckets[i]));
    }
    return palette;
}

// Apply median cut on an array of pixels

function medianCut(pixels, paletteSize) {
    if (powTwo(paletteSize) == false) {
        return [];
    }
    
    var buckets = [pixels];
    var repeats = findExponent(paletteSize);
    
    for (var i = 0; i < repeats; i += 1) {
        var splitBuckets = [];
        for (var n = 0; n < buckets.length; n += 1) {
            var splitBucket = halfPixels(buckets[n]);
            splitBuckets.push(splitBucket[0]);
            splitBuckets.push(splitBucket[1]);
        }
        buckets = splitBuckets;
    }
    
    return makePalette(buckets);
}