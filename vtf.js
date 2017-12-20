var colorTable = [];
var pixelTable = [];
var blockCount = 65280;
var width = 1024;
var height = 1020;
var hasMipmaps = 0;
var mipmapCount = 0;
var blockPosition = 0;

function setResolution() {
	document.getElementById('convertButton').disabled = true;
	document.getElementById('saveButton').disabled = true;
	document.getElementById('files0').disabled = true;
	document.getElementById("mipmaps").innerHTML = "";
	document.getElementById('canvas').getContext("2d").clearRect(0,0,width,height);
	document.getElementById("inputWrapper").innerHTML = "";
	width = parseInt(document.getElementById("widthSetting").value);
	height = parseInt(document.getElementById("heightSetting").value);
	if (width == 1024 && height == 1024) {
		height = 1020;
		document.getElementById("resolutionNotice").style.visibility = "visible";
		document.getElementById("mipmapsCheck").disabled = true;
		document.getElementById("mipmapsCheck").checked = false;
	}
	else {
		document.getElementById("resolutionNotice").style.visibility = "hidden";
		document.getElementById("mipmapsCheck").disabled = false;
	}
	document.getElementById("contentWrapper").style.width = width+"px";
	document.getElementById("contentWrapper").style.height = height+"px";
	document.getElementById("files").value = "";
	document.getElementById('canvas').getContext("2d").clearRect(0,0,width,height);
}

function handleFileSelect(evt) {
	document.getElementById('convertButton').disabled = true;
	document.getElementById('saveButton').disabled = true;
	document.getElementById('files0').disabled = true;
	var files = evt.target.files; // FileList object
	if (files[0] && files[0].type.match('image.*')) {
		var reader = new FileReader();
		// Closure to capture the file information.
		reader.onload = (function() {
			return function(e) {
				document.getElementById("inputWrapper").innerHTML = "<img id=\"my-image\" src=\""+e.target.result+"\" title=\""+escape(files[0].name)+"\"/>";
				if (height != 1020 && width > height) {
					document.getElementById("my-image").style.maxWidth = width+"px";
					document.getElementById("my-image").style.maxHeight = width+"px";
					document.getElementById("inputWrapper").style.transform = "translate(-50%, -50%) scale(1,"+height/width+")"
				}
				else if (width < height) {
					document.getElementById("my-image").style.maxWidth = height+"px";
					document.getElementById("my-image").style.maxHeight = height+"px";
					document.getElementById("inputWrapper").style.transform = "translate(-50%, -50%) scale("+width/height+",1)"
				}
				else {
					document.getElementById("my-image").style.maxWidth = width+"px";
					document.getElementById("my-image").style.maxHeight = height+"px";
					document.getElementById("inputWrapper").style.transform = "translate(-50%, -50%) scale(1,1)"
				}
			};
		})();
	// Read in the image file as a data URL.
		reader.readAsDataURL(files[0]);
		document.getElementById('convertButton').disabled = false;
	}
	document.getElementById('inputWrapper').style.display = "block";
	document.getElementById('canvas').getContext("2d").clearRect(0,0,width,height);
}

function generateCanvas(ccanvas, cwidth, cheight) {
	document.getElementById('inputWrapper').style.display = "block";
	var img = document.getElementById('my-image');
	if (ccanvas == 0) var canvas = document.getElementById('canvas');
	else var canvas = document.getElementById('canvasMipmap'+ccanvas);
	var tempCanvas = document.getElementById('tempCanvas');
	if (height != 1020 && cwidth > cheight) {
		tempCanvas.width = cwidth;
		tempCanvas.height = cwidth;
		//img.style.maxWidth = cwidth+"px";
		//img.style.maxHeight = cwidth+"px";
		canvas.width = cwidth;
		canvas.height = cheight;
		tempCanvas.getContext('2d').drawImage(img, cwidth/2-img.width/2, cwidth/2-img.height/2, img.width, img.height);
		for (var i=1; i<cwidth/cheight; i*=2) tempCanvas.getContext('2d').drawImage(tempCanvas, 0, 0, cwidth, cwidth/i, 0, 0, cwidth, cwidth/(2*i));
		canvas.getContext('2d').drawImage(tempCanvas, 0, 0, cwidth, cwidth);
		canvas.getContext('2d').clearRect(0,cheight/2+(img.height/(cwidth/cheight))/2,cwidth,cwidth);
		tempCanvas.width = 0;
		tempCanvas.height = 0;
	}
	else if (cwidth < cheight) {
		tempCanvas.width = cheight;
		tempCanvas.height = cheight;
		//img.style.maxWidth = cheight+"px";
		//img.style.maxHeight = cheight+"px";
		canvas.width = cwidth;
		canvas.height = cheight;
		tempCanvas.getContext('2d').drawImage(img, cheight/2-img.width/2, cheight/2-img.height/2, img.width, img.height);
		for (var i=1; i<cheight/cwidth; i*=2) tempCanvas.getContext('2d').drawImage(tempCanvas, 0, 0, cheight/i, cheight, 0, 0, cheight/(2*i), cheight);
		canvas.getContext('2d').drawImage(tempCanvas, 0, 0, cheight, cheight);
		canvas.getContext('2d').clearRect(cwidth/2+(img.width/(cheight/cwidth))/2,0,cheight,cheight);
		tempCanvas.width = 0;
		tempCanvas.height = 0;
	}
	else {
		canvas.width = cwidth;
		canvas.height = cheight;
		//img.style.maxWidth = cwidth+"px";
		//img.style.maxHeight = cheight+"px";
		canvas.getContext('2d').drawImage(img, cwidth/2-img.width/2, cheight/2-img.height/2, img.width, img.height);
	}
}

function createCanvas() { // put centered image on canvas
	mipmapCount = 0;
	generateCanvas(0, width, height);
	if (document.getElementById("mipmapsCheck").checked) { // create mipmap canvases
		var mipwidth = width;
		var mipheight = height;
		var mipmapsHTML = "";
		hasMipmaps = 1;
		for (var i=2; (width/i>=4) && (height/i>=4); i*=2) {
			mipmapCount++;
			mipmapsHTML += "<div id=\"inputWrapper"+mipmapCount+"\"></div>\n<canvas class=\"mipmapElement\" id=\"canvasMipmap"+mipmapCount+"\"></canvas><br /><input type=\"file\" id=\"files"+mipmapCount+"\" name=\"files[]\" accept=\"image/*\" onchange=\"changeMipmap(event,"+mipmapCount+")\" />\n";
		}
		document.getElementById("mipmaps").innerHTML = mipmapsHTML;
		for (var i=1; i<=mipmapCount; i++) {
			mipwidth /= 2;
			mipheight /= 2;
			document.getElementById("canvasMipmap"+i).width = mipwidth;
			document.getElementById("canvasMipmap"+i).height = mipheight;
			if (i>1) document.getElementById("canvasMipmap"+i).getContext('2d').drawImage(document.getElementById("canvasMipmap"+(i-1)),0, 0, mipwidth, mipheight);
			else document.getElementById("canvasMipmap"+i).getContext('2d').drawImage(document.getElementById("canvas"), 0, 0, mipwidth, mipheight);
		}
	}
	else {
		hasMipmaps = 0;
		document.getElementById("mipmaps").innerHTML = "";
	}
}

function convert() {
	blockPosition = 0;
	document.body.style.cursor = "url(img/aero_derpy_busy.ani), wait";
	createCanvas();
	blockCount = 0;
	for (var i=mipmapCount; i>0; i--) convertPixels('canvasMipmap'+i,width/(Math.pow(2,i)),height/(Math.pow(2,i)));
	convertPixels('canvas', width, height);
	document.getElementById('inputWrapper').style.display = "none";
	document.getElementById('saveButton').disabled = false;
	document.getElementById('files0').disabled = false;
	document.body.style.cursor = "auto";
}

function changeMipmap(evt,mipmapNumber) { // this code, it scares me
	document.getElementById('convertButton').disabled = true;
	document.getElementById('saveButton').disabled = true;
	var files = evt.target.files; // FileList object
	if (files[0] && files[0].type.match('image.*')) {
		var reader = new FileReader();
		// Closure to capture the file information.
		reader.onload = (function() {
			return function(e) {
				document.getElementById("inputWrapper").innerHTML = "<img id=\"my-image\" src=\""+e.target.result+"\" title=\""+escape(files[0].name)+"\"/>";
				if (height != 1020 && width > height) {
					document.getElementById("my-image").style.maxWidth = width/(Math.pow(2,mipmapNumber))+"px";
					document.getElementById("my-image").style.maxHeight = width/(Math.pow(2,mipmapNumber))+"px";
					document.getElementById("inputWrapper").style.transform = "translate(-50%, -50%) scale(1,"+height/width+")"
				}
				else if (width < height) {
					document.getElementById("my-image").style.maxWidth = height/(Math.pow(2,mipmapNumber))+"px";
					document.getElementById("my-image").style.maxHeight = height/(Math.pow(2,mipmapNumber))+"px";
					document.getElementById("inputWrapper").style.transform = "translate(-50%, -50%) scale("+width/height+",1)"
				}
				else {
					document.getElementById("my-image").style.maxWidth = width/(Math.pow(2,mipmapNumber))+"px";
					document.getElementById("my-image").style.maxHeight = height/(Math.pow(2,mipmapNumber))+"px";
					document.getElementById("inputWrapper").style.transform = "translate(-50%, -50%) scale(1,1)"
				}
					document.getElementById('inputWrapper').style.display = "block";
				if (mipmapNumber == 0) {
					document.getElementById('canvas').getContext("2d").clearRect(0,0,width,height);
					generateCanvas(mipmapNumber,width,height);
				}
				else {
					document.getElementById('canvasMipmap'+mipmapNumber).getContext("2d").clearRect(0,0,width/(Math.pow(2,mipmapNumber)),height/(Math.pow(2,mipmapNumber)));
					generateCanvas(mipmapNumber,width/(Math.pow(2,mipmapNumber)),height/(Math.pow(2,mipmapNumber)));
				}
				blockPosition = 0;
				for (var i=mipmapCount; i>mipmapNumber; i--) {
					blockPosition += ((width/(Math.pow(2,i)))*(height/(Math.pow(2,i))))/8;
				}
				document.body.style.cursor = "url(img/aero_derpy_busy.ani), wait";
				var tempBlockCount = blockCount; // saving correct block count
				if (mipmapNumber == 0) convertPixels('canvas', width, height);
				else convertPixels('canvasMipmap'+mipmapNumber, width/(Math.pow(2,mipmapNumber)),height/(Math.pow(2,mipmapNumber)));
				blockCount = tempBlockCount; // restoring correct block count
				document.getElementById('inputWrapper').style.display = "none";
				document.getElementById('saveButton').disabled = false;
				document.body.style.cursor = "auto";
			};
		})();
	// Read in the image file as a data URL.
		reader.readAsDataURL(files[0]);
	}
}

function convertPixels(canvas, fwidth, fheight) {
	var pix = document.getElementById(canvas).getContext("2d").getImageData(0, 0, fwidth, fheight);
	for (var b=0; b<=2; b++) {
		if (document.getElementById("brightnessform")[b].checked) var brightness = b;
	}
	var position = 0;
	for (var j=0; j<fheight/4; j++) { // rows of blocks
		for (var i=0; i<fwidth/4; i++) { // columns of blocks
			var lumaMax = 0;
			var lumaMin = 255;
			var pikselMax = [0,0,0];
			var pikselMin = [255,255,255];
			var isAlpha = false;
			var pixelOrder = [0,2,3,1]; // kolejność kolorów dla nieodwróconych kolorów bez przezroczystości
			blockCount++;
			// 0 - color1, 1 - color2, 2 - color1.33(or 1.5), 3 - color1.66(or alpha)
			for (var y=0; y<4; y++) { // pixel rows in block
				for (var x=0; x<16; x+=4) { // pixel columns in block
					position = x+(fwidth*4*y)+(16*i)+(fwidth*16*j); // position of a pixel in canvas
					var luma = (0.2126*pix.data[position])+(0.7152*pix.data[position+1])+(0.0722*pix.data[position+2]); // ITU-R BT.709
					if (pix.data[position+3] > 127) { // find most different colors, unless transparent
						if (luma > lumaMax) {
							lumaMax = luma;
							pikselMax[0] = pix.data[position];
							pikselMax[1] = pix.data[position+1];
							pikselMax[2] = pix.data[position+2];
						}
						if (luma < lumaMin) {
							lumaMin = luma;
							pikselMin[0] = pix.data[position];
							pikselMin[1] = pix.data[position+1];
							pikselMin[2] = pix.data[position+2];
						}
					}
					else isAlpha = true;
				}
			}
			colorTable[blockPosition] = (Math.round((pikselMin[0]+(2*brightness))*31/255)<<11)+(Math.round((pikselMin[1]+brightness)*63/255)<<5)+(Math.round((pikselMin[2]+(2*brightness))*31/255)); // RGB888 to RGB565 color1
			colorTable[blockPosition+1] = (Math.round((pikselMax[0]+(2*brightness))*31/255)<<11)+(Math.round((pikselMax[1]+brightness)*63/255)<<5)+(Math.round((pikselMax[2]+(2*brightness))*31/255)); // RGB888 to RGB565 color2
			pikselMin[0] = Math.round((pikselMin[0]+(2*brightness))*31/255)<<3;
			pikselMin[1] = Math.round((pikselMin[1]+brightness)*63/255)<<2;
			pikselMin[2] = Math.round((pikselMin[2]+(2*brightness))*31/255)<<3;
			pikselMax[0] = Math.round((pikselMax[0]+(2*brightness))*31/255)<<3;
			pikselMax[1] = Math.round((pikselMax[1]+brightness)*63/255)<<2;
			pikselMax[2] = Math.round((pikselMax[2]+(2*brightness))*31/255)<<3;
			if (document.getElementById("lumaavgform")[0].checked) var lumaAvg = (lumaMax+lumaMin)/2;
			else var lumaAvg = Math.sqrt(((lumaMax*lumaMax)+(lumaMin*lumaMin))/2);
			if (isAlpha == false) { // bez przezroczystości w bloku
				if (colorTable[blockPosition] < colorTable[blockPosition+1]) { // upewnijmy się że kolor1 > kolor2
					var temp = colorTable[blockPosition];
					colorTable[blockPosition] = colorTable[blockPosition+1];
					colorTable[blockPosition+1] = temp;
					pixelOrder = [1,3,2,0];
				}
				if (colorTable[blockPosition] == colorTable[blockPosition+1]) { // wyjątek
					if (colorTable[blockPosition+1] > 0) {
						colorTable[blockPosition+1]--; // na zapas, żeby silnik gry nie myślał że blok ma przezroczystość
						pixelOrder = [0,0,0,0];
					}
					else {
						colorTable[blockPosition]++;
						pixelOrder = [1,1,1,1];
					}
				}
				if (document.getElementById("lumathrform")[0].checked) {
					var lumaBelow = (lumaMin+lumaAvg)/2; // poniżej tego progu rysuj pikselMin
					var lumaAbove = (lumaMax+lumaAvg)/2; // poniżej tego progu rysuj piksel23
				}
				else {
					var lumaBelow = Math.sqrt(((lumaMin*lumaMin)+(lumaAvg*lumaAvg))/2); // poniżej tego progu rysuj pikselMin
					var lumaAbove = Math.sqrt(((lumaMax*lumaMax)+(lumaAvg*lumaAvg))/2); // poniżej tego progu rysuj piksel23
				}
				var piksel13 = [(pikselMin[0]+pikselMin[0]+pikselMax[0])/3,(pikselMin[1]+pikselMin[1]+pikselMax[1])/3,(pikselMin[2]+pikselMin[2]+pikselMax[2])/3]; // 1/3 między kolorami
				var piksel23 = [(pikselMin[0]+pikselMax[0]+pikselMax[0])/3,(pikselMin[1]+pikselMax[1]+pikselMax[1])/3,(pikselMin[2]+pikselMax[2]+pikselMax[2])/3]; // 2/3 między kolorami
				pixelTable[blockPosition] = 0;
				pixelTable[blockPosition+1] = 0;
				for (var y=0; y<4; y++) {
					for (var x=0; x<16; x+=4) {
						position = x+(fwidth*4*y)+(16*i)+(fwidth*16*j);
						var luma = (0.2126*pix.data[position])+(0.7152*pix.data[position+1])+(0.0722*pix.data[position+2]); // ITU-R BT.709
						if (luma < lumaBelow) { 
							pix.data[position] = pikselMin[0];
							pix.data[position+1] = pikselMin[1];
							pix.data[position+2] = pikselMin[2];
							if (y<2) pixelTable[blockPosition] += pixelOrder[0] << 2*((x/4)+(4*y)); // first two rows
							else pixelTable[blockPosition+1] += pixelOrder[0] << 2*((x/4)+(4*(y-2))); // last two rows
						}
						else if (luma < lumaAvg) { 
							pix.data[position] = piksel13[0];
							pix.data[position+1] = piksel13[1];
							pix.data[position+2] = piksel13[2];
							if (y<2) pixelTable[blockPosition] += pixelOrder[1] << 2*((x/4)+(4*y));
							else pixelTable[blockPosition+1] += pixelOrder[1] << 2*((x/4)+(4*(y-2)));
						}
						else if (luma < lumaAbove) {
							pix.data[position] = piksel23[0];
							pix.data[position+1] = piksel23[1];
							pix.data[position+2] = piksel23[2];
							if (y<2) pixelTable[blockPosition] += pixelOrder[2] << 2*((x/4)+(4*y));
							else pixelTable[blockPosition+1] += pixelOrder[2] << 2*((x/4)+(4*(y-2)));
						}
						else {
							pix.data[position] = pikselMax[0];
							pix.data[position+1] = pikselMax[1];
							pix.data[position+2] = pikselMax[2];
							if (y<2) pixelTable[blockPosition] += pixelOrder[3] << 2*((x/4)+(4*y));
							else pixelTable[blockPosition+1] += pixelOrder[3] << 2*((x/4)+(4*(y-2)));
						}
					}
				}
			}
			else {
				pixelOrder = [0,2,1,3];
				if (colorTable[blockPosition] > colorTable[blockPosition+1]) { // upewnijmy się że kolor1 <= kolor2
					var temp = colorTable[blockPosition];
					colorTable[blockPosition] = colorTable[blockPosition+1];
					colorTable[blockPosition+1] = temp;
					pixelOrder = [1,2,0,3];
				}
				var pikselAvg = [(pikselMin[0]+pikselMax[0])/2,(pikselMin[1]+pikselMax[1])/2,(pikselMin[2]+pikselMax[2])/2];
				if (document.getElementById("lumathrform")[0].checked) {
					var lumaMinimum = (lumaMin+lumaMin+lumaAvg)/3; // poniżej tego progu rysuj pikselMin
					var lumaMaximum = (lumaMax+lumaMax+lumaAvg)/3; // poniżej tego progu rysuj pikselAvg
				}
				else {
					var lumaMinimum = Math.sqrt(((lumaMin*lumaMin)+(lumaMin*lumaMin)+(lumaAvg*lumaAvg))/3); // poniżej tego progu rysuj pikselMin
					var lumaMaximum = Math.sqrt(((lumaMax*lumaMax)+(lumaMax*lumaMax)+(lumaAvg*lumaAvg))/3); // poniżej tego progu rysuj pikselAvg
				}
				pixelTable[blockPosition] = 0;
				pixelTable[blockPosition+1] = 0;
				for (var y=0; y<4; y++) {
					for (var x=0; x<16; x+=4) {
						position = x+(fwidth*4*y)+(16*i)+(fwidth*16*j);
						var luma = (0.2126*pix.data[position])+(0.7152*pix.data[position+1])+(0.0722*pix.data[position+2]); // ITU-R BT.709
						if (pix.data[position+3] < 128) {
							pix.data[position+3] = 0;
							if (y<2) pixelTable[blockPosition] += pixelOrder[3] << 2*((x/4)+(4*y));
							else pixelTable[blockPosition+1] += pixelOrder[3] << 2*((x/4)+(4*(y-2)));
						}
						else {
							if (luma < lumaMinimum) { 
								pix.data[position] = pikselMin[0];
								pix.data[position+1] = pikselMin[1];
								pix.data[position+2] = pikselMin[2];
								if (y<2) pixelTable[blockPosition] += pixelOrder[0] << 2*((x/4)+(4*y));
								else pixelTable[blockPosition+1] += pixelOrder[0] << 2*((x/4)+(4*(y-2)));
							}
							else if (luma < lumaMaximum) { 
								pix.data[position] = pikselAvg[0];
								pix.data[position+1] = pikselAvg[1];
								pix.data[position+2] = pikselAvg[2];
								if (y<2) pixelTable[blockPosition] += pixelOrder[1] << 2*((x/4)+(4*y));
								else pixelTable[blockPosition+1] += pixelOrder[1] << 2*((x/4)+(4*(y-2)));
							}
							else {
								pix.data[position] = pikselMax[0];
								pix.data[position+1] = pikselMax[1];
								pix.data[position+2] = pikselMax[2];
								if (y<2) pixelTable[blockPosition] += pixelOrder[2] << 2*((x/4)+(4*y));
								else pixelTable[blockPosition+1] += pixelOrder[2] << 2*((x/4)+(4*(y-2)));
							}
						}
					}
				}
			}
			blockPosition += 2; // block number*2 (for double arrays)
		}
	}

	document.getElementById(canvas).getContext("2d").putImageData(pix,0,0);
}

function createVTF() {
	var file = new Uint8Array((blockCount*8)+64);
	var header = [86,84,70,0,7,0,0,0,1,0,0,0,64,0,0,0,width&0xFF,(width>>>8)&0xFF,height&0xFF,(height>>>8)&0xFF,12,35-hasMipmaps,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,13,0,0,0,mipmapCount+1,13,0,0,0,0,0,1]; // 64B (bare minimum)
	for (var i=0; i<header.length; i++) {
		file[i] = header[i];
	}
	for (var i=64; i<file.length; i+=8) {
		var blockNum = (i-64)/4;
		file[i] = colorTable[blockNum] & 0xFF; // drugi bajt pierwszego koloru
		file[i+1] = (colorTable[blockNum] >>> 8) & 0xFF; // pierwszy bajt pierwszego koloru
		file[i+2] = colorTable[blockNum+1] & 0xFF; // drugi bajt drugiego koloru
		file[i+3] = (colorTable[blockNum+1] >>> 8) & 0xFF; // pierwszy bajt drugiego koloru

		file[i+4] = pixelTable[blockNum] & 0xFF; // drugi rząd pikseli
		file[i+5] = (pixelTable[blockNum] >>> 8) & 0xFF; // pierwszy rząd pikseli
		file[i+6] = pixelTable[blockNum+1] & 0xFF; // czwarty rząd pikseli
		file[i+7] = (pixelTable[blockNum+1] >>> 8) & 0xFF; // trzeci rząd pikseli (chyba)
	}
	
	download(file, "spray.vtf")
}

// Function to download data to a file
function download(data, filename) {
    var a = document.createElement("a"),
        file = new Blob([data], {type: "application/octet-stream"});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
}
