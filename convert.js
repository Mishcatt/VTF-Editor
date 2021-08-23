importScripts('dxt.js');
importScripts('dither.js');

var colorSqrt = false;
onmessage = function(e) {

    console.log('Message received from main script');

    let data = e.data;
    let pix = data.pix;
    let quality = data.quality;
    let fwidth = data.fwidth;
    let fheight = data.fheight;
    let frameColumn = data.frameColumn;
    let outputType = data.outputType;
    pix = data.imageData;
    let canvas = data.canvas;
    let dither = data.dither;
    let stripStart = data.stripStart;
    let stripHeight = data.stripHeight;
    let strip = data.strip;
    
    let send = {};

    send.canvas = canvas;
    send.frameColumn = frameColumn;
    send.fwidth = fwidth;
    send.stripStart = stripStart;
    send.stripHeight = stripHeight;
    send.strip = strip;

    let outputImage;
    let valueTable;
    console.log("type "+ outputType);

    if (outputType == 13 || outputType == 15) {
        var outimg = new Int32Array(Math.ceil(fwidth/4)*4*Math.ceil(stripHeight/4)*4/ (outputType == 13 ? 8 : 4));
        //var progressEl= document.getElementById("progress");
        m_nRefinementSteps = quality;
        m_nRefinementStepsAlpha = quality+1;
        m_b3DRefinement = quality == 3;
        m_bUseAdaptiveWeighting = quality > 1;
        m_nCompressionSpeed = quality == 0 ? CMP_Speed_Fast : CMP_Speed_Normal;
        m_nCompressionSpeedAlpha = quality == 1 ? CMP_Speed_Fast : CMP_Speed_Normal;
        if (quality == 3)
            m_nRefinementSteps -=1;

        var bufsrc = new Int32Array(16);
        var bufprv = new Uint8Array(64);
        var bufsrcalpha = new Uint8Array(16);
        var bufout = new Int32Array(2);
        let blockPosition = 0;
        /*var dith = false;
        if (document.getElementById('ditherCheck').checked) {
            dith = true;
            var dpix = mipmaps[canvas].getContext("2d").getImageData(mipmaps[canvas].width/2 - fwidth/2, 0, fwidth, fheight);
            reduceColors(dpix,5,6,5,8,true);
        }*/
        
        valueTable = outimg;
        var position = 0;
        
        for (var j=0; j<pix.height/4; j++) { // rows of blocks
            for (var i=0; i<data.fwidth/4; i++) { // columns of blocks
            //blockCount+=1;
            for (var y = 0; y < 4; y++){
                for (var x = 0; x < 4; x++){
                    position = x*4+(16*i)+(fwidth*16*j)+(fwidth*4*y);
                    bufsrc[x+y*4]=(pix.data[position+3]<<24)+(pix.data[position]<<16)+(pix.data[position+1]<<8)+pix.data[position+2];
                }
            }
            if (outputType == 15) {
                for (var y = 0; y < 4; y++){
                    for (var x = 0; x < 4; x++){
                        position = x*4+(16*i)+(fwidth*16*j)+(fwidth*4*y);
                        bufsrcalpha[x+y*4]=pix.data[position+3];
                    }
                }
                CompressAlphaBlock(bufsrcalpha,bufout,bufprv);
                outimg.set(bufout,blockPosition);
                blockPosition+=2;
            }
            CompressRGBBlock(bufsrc,bufout,CalculateColourWeightings(bufsrc), outputType==13, outputType==13, 127,bufprv)
                for (var y = 0; y < 4; y++){
                    for (var x = 0; x < 4; x+=1){
                        position = x*4+(16*i)+(fwidth*16*j)+(fwidth*4*y);
                        pix.data[position]=bufprv[(x+y*4)*4+2];
                        pix.data[position+1]=bufprv[(x+y*4)*4+1];
                        pix.data[position+2]=bufprv[(x+y*4)*4];
                        pix.data[position+3]=bufprv[(x+y*4)*4+3];
                    }
                }
            outimg.set(bufout,blockPosition);
            blockPosition+=2;
            }
        }

        send.valueTable = outimg;
    }
    else if(outputType == 0) {
        outputImage = pix.data;
    }
    else if (outputType == 2) {
        for (var i = 0; i < pix.data.length; i += 4){
            pix.data[i+3] = 255;
        }
        outputImage = pix.data;
    }
    else if(outputType == 4) {
        for (var i = 0; i < pix.data.length; i += 4){
            pix.data[i+3] = 255;
        }
        reduceColors(pix, 5, 6, 5, 8, dither);
        outputImage = pix.data;
    }
    else if(outputType == 21) {
        reduceColors(pix, 5, 5, 5, 1, dither);
        outputImage = pix.data;
    }
    else if(outputType == 19) {
        reduceColors(pix, 4, 4, 4, 4, dither);
        outputImage = pix.data;
    }

    send.outputImage = outputImage;
    send.pix = pix;
    console.log('Posting message back to main script');
    postMessage(send);
}

function reduceColors(data, rb, gb, bb, ab, dith) {
	var d = data.data;
	var rs = 8-rb;
	var gs = 8-gb;
	var bs = 8-bb;
	var as = 8-ab;
	var rm = 255 / (255 >> rs);
	var gm = 255 / (255 >> gs);
	var bm = 255 / (255 >> bs);
	var am = 255 / (255 >> as);
	for (var x = 0; x < data.width; x += 1) {
        for (var y = 0; y < data.height; y += 1) {
            
            var pixel = (y * data.width * 4) + (x * 4);
			var color = [d[pixel], d[pixel + 1], d[pixel + 2]];
			
			var floor = [Math.round(Math.floor(d[pixel] / rm) * rm),Math.round(Math.floor(d[pixel+1] / gm) * gm),Math.round(Math.floor(d[pixel+2] / bm) * bm)];
			var ceil = [Math.round(Math.ceil(d[pixel] / rm) * rm),Math.round(Math.ceil(d[pixel+1] / gm) * gm),Math.round(Math.ceil(d[pixel+2] / bm) * bm)];
			var closest = bestMatch([floor, ceil], color);

			if (closest[0] == floor[0] && closest[1] == floor[1] && closest[2] == floor[2]){
				var closest2 = ceil;
			}
			else{
				var closest2 = floor;
			}
			var alpha = Math.round(Math.floor(d[pixel+3] / am) * am);
			var alpha2 = Math.round(Math.ceil(d[pixel+3] / am) * am);
			if (Math.abs(alpha - d[pixel+3]) > Math.abs(alpha2 - d[pixel+3])){
				alpha = alpha2;
			}
			if (dith) {
				var between;
					
				between = [];
			
				// Get the 17 colors between the two previously found colors
			
				for (var b = 0; b < 17; b += 1) {
					between.push([closest[0] + (closest2[0] - closest[0]) * b/16,closest[1] + (closest2[1] - closest[1]) * b/16,closest[2] + (closest2[2] - closest[2]) * b/16]/*addColor(closest, multiplyColor(divideColor(closest2, 17), b))*/);
				}
				// Get the closest shade to the current pixel from the new 15 colors
				
				var closest3 = bestMatch(between, color);
				var index3 = between.indexOf(closest3);
				
				// Use the dithering matrix that is based on the closest shade and pick the color
				
				var trans = [closest, closest2][getDither(dither[index3], x, y)];
				d[pixel] = trans[0];
				d[pixel + 1] = trans[1];
				d[pixel + 2] = trans[2];
				
				// Apply the color to the image with full opacity
			}
			else {
				d[pixel] = closest[0];
				d[pixel + 1] = closest[1];
				d[pixel + 2] = closest[2];
			}
            d[pixel + 3] = alpha;     
        }
    }
    
    // context.putImageData(png, 0, 0);
}