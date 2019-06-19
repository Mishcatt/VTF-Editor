var colorTable = [];
var pixelTable = [];
var valueTable = [];
var alphaValueTable = [];
var alphaLookupTable = [];
var blockCount = 65280;
var width = 1024;
var height = 1024;
var hasMipmaps = false;
var mipmapCount = 0;
var blockPosition = 0;
var frameCount = 1;
var frames = [];
var currFrame = 0;
var imagesLoaded = 0;
var singleImageAnim = false;
var mipmaps = [document.createElement('canvas')];
var converted = false;
var outputType = 13;
var outputImage = [];
var shortened = false;
var colorSqrt = false;
var forceDither = false;
var lumaPow = false;
var colorDifference = 0;
var cresizer = document.createElement('canvas');
var outdxt;
setResolution();
function setResolution() {
	setOutputType(document.getElementById('format'));
	colorTable = [];
	pixelTable = [];
	valueTable = [];
	alphaValueTable = [];
	alphaLookupTable = [];
	blockCount = 65280;
	mipmapCount = 0;
	blockPosition = 0;
	currFrame = 0;
	//imagesLoaded = 0;
	mipmaps = [document.createElement('canvas')];
	converted = false;
	outputImage = [];
	shortened = false;
	//document.getElementById('convertButton').disabled = true;
	document.getElementById('saveButton').disabled = true;
	document.getElementById('files0').disabled = true;
	document.getElementById("mipmaps").innerHTML = "";
	document.getElementById("resolutionNotice").style.visibility = "hidden";
	width = parseInt(document.getElementById("widthSetting").value);
	height = parseInt(document.getElementById("heightSetting").value);
	
	/*if (width == 1024 && height == 1024) {
		height = 1020;
		document.getElementById("resolutionNotice").style.visibility = "visible";
		document.getElementById("mipmapsCheck").disabled = true;
		document.getElementById("mipmapsCheck").checked = false;
	}
	else {
		document.getElementById("resolutionNotice").style.visibility = "hidden";
		document.getElementById("mipmapsCheck").disabled = false;
	}*/
	check();
	mipmaps[0].width = width;
	mipmaps[0].height = height;
	document.getElementById('preview').getContext("2d").clearRect(0,0,width,height);
	document.getElementById("contentWrapper").style.width = width+"px";
	document.getElementById("contentWrapper").style.height = height+"px";
	document.getElementById("files").value = "";
	mipmaps[0].getContext("2d").clearRect(0,0,width,height);
	if (frames.length > 0){
		createCanvas();
		document.getElementById('convertButton').disabled = false;
	}
	else {
		document.getElementById('convertButton').disabled = true;
	}
}

function check() {
	if (getEstFileSize(false)/1024 >= 512 && getEstFileSize(false)/1024 < 513){
		shortened = true;
		document.getElementById("resolutionNotice").innerHTML = "Changed to "+(width-4)+"x"+height;
		document.getElementById("resolutionNotice").style.visibility = "visible";
	}
	else if (shortened && getEstFileSize(false)/1024 < ((width - 4) / width) * 512 - 1){
		shortened = false;
		document.getElementById("resolutionNotice").innerHTML = "";
		document.getElementById("resolutionNotice").style.visibility = "hidden";
	}
	if (getEstFileSize(false)/1024 >= 385 || shortened || document.getElementById("sampling").value == 1){
		document.getElementById("mipmapsCheck").disabled = true;
		document.getElementById("mipmapsCheck").checked = false;
	}
	else{
		document.getElementById("mipmapsCheck").disabled = false;
	}
	reducedMipmaps = getEstFileSize(false)/1024 >= 384;
	showMipmap(document.getElementById("mipmapsCheck"));
}
setInterval(function(){
	if (frameCount > 1 && (imagesLoaded == frameCount || singleImageAnim)) {
		//console.log("ffd")
		if (++currFrame >= frameCount)
			currFrame = 0;
			var mipwidth = width;
			var mipheight = height;
		for(var i = 0; i <= mipmapCount; i++) {
			
			generatePreview(i, mipwidth, mipheight);
			mipwidth /= 2;
			mipheight /= 2;
		}
	}
	var filesize = getEstFileSize(true)/1024;
	if (filesize < 512)
		document.getElementById('filesizee').innerHTML = "Estimated file size: <span style='color:green'>"+filesize+"</span> [KB]";
	else
		document.getElementById('filesizee').innerHTML = "Estimated file size: <span style='color:red'>"+filesize+"</span> [KB]";

}, 200);

function handleFileSelect(evt) {
	var files = evt.target.files; // FileList object
	if (files.length == 0)
		return;
	document.getElementById('convertButton').disabled = true;
	document.getElementById('saveButton').disabled = true;
	document.getElementById('files0').disabled = true;
	
	imagesLoaded = 0;
	frameCount = files.length;
	frames = [];
	frames[0] = [];
	currFrame = 0;
	document.body.style.cursor = "url(img/aero_derpy_busy.ani), wait";
	for (var i = 0; i < files.length; i++ ) {
		if (files[i] && files[i].type.match('image.*')) {
			var reader = new FileReader();
			// Closure to capture the file information.
			reader.fileIndex = i;
			reader.fileType = files[i].type;
			
			reader.onload = (function(e) {
					//console.log(this.fileType);
					var img = new Image();
					if (this.fileType == "image/gif"){
						frameCount = 0;
						var gif = new SuperGif( {gif: img, auto_play: false});
						gif.load_raw(new Uint8Array(e.target.result), function (el) {handleGifLoad(gif, frames[0]); check(); createCanvas();});
					}
					else if (this.fileType == "image/x-tga" || this.fileType == "image/targa"){
						var tga = new TGA();
						tga.load(new Uint8Array(e.target.result));
						if (singleImageAnim)
							frameCount = img.height / height;
						imagesLoaded += 1;
						frames[0].push(tga.getCanvas());
						if (imagesLoaded == frameCount) {
							check();
							createCanvas();
							document.body.style.cursor = "auto";
						}
					}
					else {
						img.src = e.target.result;
						
						img.onload = function () {
							if (singleImageAnim)
								frameCount = img.height / height;
							imagesLoaded += 1;
							frames[0].push(img);
							if (imagesLoaded == frameCount) {
								check();
								createCanvas();
								document.body.style.cursor = "auto";
							}
						}
					}
					
				});
			document.getElementById('convertButton').disabled = false;
			if (files[i].type == "image/gif" || files[i].type == "image/x-tga" || files[i].type == "image/targa"){
				reader.readAsArrayBuffer(files[i]);
				if (files[i].type == "image/gif")
					break;
			}
			else
				reader.readAsDataURL(files[i]);
			
		}
	}
	mipmaps[0].getContext("2d").clearRect(0,0,width,height);
}


function showMipmap(check){
	hasMipmaps = check.checked;
	if (hasMipmaps) {
		document.getElementById("mipmaps").style.display = "block";
	}
	else {
		document.getElementById("mipmaps").style.display = "none";
	}
}

function generatePreview(index, cwidth, cheight) {
	//console.log("Index" + index);

	if (index == 0) var output = document.getElementById('preview');
	else var output = document.getElementById('canvasMipmap'+index);
	var input = mipmaps[index];
	output.getContext("2d").clearRect(0,0,cwidth,cheight);

	output.width = cwidth;
	output.height = cheight;
	output.getContext('2d').drawImage(input, 0, cheight * currFrame, cwidth, cheight, 0, 0, cwidth, cheight);

}

function setSingleFrame() {
	singleImageAnim = document.getElementById('singleFrame').checked;
	if (singleImageAnim && frames[0]) {
		frameCount = frames[0].height / height;
	}
	else {
		frameCount = frames.length;
	}
}

function getFrameRows() {
	return Math.min(frameCount,Math.floor(32767/height));
}

function getFrameColumns() {
	return Math.ceil(frameCount * height / 32767);
}

function generateCanvas(ccanvas, cwidth, cheight) {

	var canvas = mipmaps[ccanvas];
	canvas.width = cwidth * getFrameColumns();
	canvas.height = cheight * getFrameRows();

	if (singleImageAnim) {
		var fimg = frames[ccanvas][0];
		canvas.height = fimg.height;
		var scale = cheight / height;
		canvas.getContext('2d').drawImage(fimg, cwidth/2-fimg.width * scale /2, 0, fimg.width * scale, fimg.height * scale);
	}
	else {
		for (var frame = 0; frame < frameCount; frame++ ){
			var fimg = frames[ccanvas][frame];
			var scale = 1;
			if (document.getElementById("rescaleCheck").checked)
				scale = Math.min(cheight/fimg.height,cwidth/fimg.width);
			canvas.getContext('2d').drawImage(fimg, cwidth/2-fimg.width * scale /2+ Math.floor(frame * height / 32767)*cwidth, cheight/2-fimg.height * scale/2 + cheight * (frame % getFrameRows()), fimg.width * scale, fimg.height * scale);
		}
	}
	document.getElementById('filesizee').innerHTML = "Estimated file size: "+(getEstFileSize()/1024);
}

function createCanvas() { // put centered image on canvas
	if (frames.length == 0)
		return;
	mipmapCount = 0;
	generateCanvas(0, width, height);
	generatePreview(0, width, height);
	var mipwidth = width;
	var mipheight = getTotalImageHeight();
	var mipmapsHTML = "";
	//hasMipmaps = 1;
	for (var i=2; (width/i>=4) && (height/i>=4); i*=2) {
		mipmapCount++;
		mipmaps.push(document.createElement('canvas'));
		mipmapsHTML += "<div id=\"inputWrapper"+mipmapCount+"\"></div>\n<canvas class=\"mipmapElement\" id=\"canvasMipmap"+mipmapCount+"\"></canvas><br /><input type=\"file\" id=\"files"+mipmapCount+"\" name=\"files[]\" accept=\"image/*\" onchange=\"changeMipmap(event,"+mipmapCount+")\" multiple/>\n";
	}
	document.getElementById("mipmaps").innerHTML = mipmapsHTML;
	for (var i=1; i<=mipmapCount; i++) {
		mipwidth /= 2;
		mipheight /= 2;
		mipmaps[i].width = mipwidth;
		mipmaps[i].height = mipheight;
		document.getElementById('canvasMipmap'+i).width = mipwidth;
		document.getElementById('canvasMipmap'+i).height = mipheight / frameCount;
		if (!frames[i])
			mipmaps[i].getContext('2d').drawImage(mipmaps[(i-1)],0, 0, mipwidth, mipheight);
		else
			generateCanvas(i, mipwidth, mipheight / frameCount);
		generatePreview(i, mipwidth, mipheight / frameCount);
	}
}

function convert() {
	blockPosition = 0;
	document.body.style.cursor = "url(img/aero_derpy_busy.ani), wait";
	
	createCanvas();
	blockCount = 0;
	if (hasMipmaps)
		for (var i=getReducedMipmapCount(); i>0; i--) convertPixels(i,width/(Math.pow(2,i)),getTotalImageHeight()/(Math.pow(2,i)));
	convertPixels(0, width, getTotalImageHeight());
	converted = true;
	//document.getElementById('inputWrapper').style.display = "none";
	document.getElementById('saveButton').disabled = false;
	document.getElementById('saveButtonVMT').disabled = false;
	document.getElementById('files0').disabled = false;
	document.body.style.cursor = "auto";
	generatePreview(0,width, height);
}



function changeMipmap(evt,mipmapNumber) { // this code, it scares me
	var files = evt.target.files; // FileList object
	if (files.length == 0)
		return;

	document.getElementById('convertButton').disabled = true;
	document.getElementById('saveButton').disabled = true;
	
	var mipimages = 0;
	var cwidth = width/(Math.pow(2,mipmapNumber));
	var cheight = height/(Math.pow(2,mipmapNumber));
	frames[mipmapNumber] = [];
	for (var i = 0; i < files.length && i < imagesLoaded; i++ ) {
		if (files[i] && files[i].type.match('image.*')) {
			var reader = new FileReader();
			// Closure to capture the file information.
			reader.fileType = files[i].type;
			reader.onload = (function(e) {
					var img = new Image();
					if (this.fileType == "image/gif"){
						var gif = new SuperGif( {gif: img, auto_play: false});
						gif.load_raw(new Uint8Array(e.target.result), 
						function (el) {
							handleGifLoad(gif, frames[mipmapNumber]);
							loadMipmaps(mipmapNumber, cwidth, cheight);
						});
					}
					else if (this.fileType == "image/x-tga"  || this.fileType == "image/targa"){
						var tga = new TGA();
						tga.load(new Uint8Array(e.target.result));
						frames[mipmapNumber].push(tga.getCanvas());
						mipimages++;
						if (mipimages == Math.min(imagesLoaded, files.length)) {
							loadMipmaps(mipmapNumber, cwidth, cheight);
						}
					}
					else{
						
						img.src = e.target.result;
						img.onload = function () {
							frames[mipmapNumber].push(img);
							mipimages++;
							if (mipimages == Math.min(imagesLoaded, files.length)) {
								loadMipmaps(mipmapNumber, cwidth, cheight);
							}
						}
					}
					
					
				});
		// Read in the image file as a data URL.
			if (files[i].type == "image/gif" || files[i].type == "image/x-tga" || files[i].type == "image/targa"){
				reader.readAsArrayBuffer(files[i]);
				if (files[i].type == "image/gif")
					break;
			}
			else
				reader.readAsDataURL(files[i]);
		}
	}
}

function loadMipmaps(mipmapNumber, cwidth, cheight) {
	if (frames[mipmapNumber].length < imagesLoaded){
		var init = frames[mipmapNumber].length;
		for (var j = frames[mipmapNumber].length; j < imagesLoaded; j++){
			frames[mipmapNumber].push(frames[mipmapNumber][j % init]);
		}
	}
	mipmaps[mipmapNumber].getContext("2d").clearRect(0,0,cwidth,cheight * frameCount);
	generateCanvas(mipmapNumber, cwidth, cheight);
	generatePreview(mipmapNumber, cwidth, cheight);
	
	document.getElementById('saveButton').disabled = true;
	document.getElementById('convertButton').disabled = false;
	document.body.style.cursor = "auto";
}

function getReducedMipmapCount() {
	if (reducedMipmaps){
		return Math.min(4, mipmapCount);
	}
	return mipmapCount;
}
function setOutputType(el){
	outputType = el.value;
	if (el.value != 0 && el.value != 2 && el.value != 13 && el.value != 15)
		document.getElementById('ditherBlock').style.display = "block";
	else
		document.getElementById('ditherBlock').style.display = "none";

	if (el.value == 13 || el.value == 15){
		document.getElementById('dxtSettings').style.display = "block";
	}
	else
		document.getElementById('dxtSettings').style.display = "none";
	check();
	createCanvas();
}



function convertPixels(canvas, fwidth, fheight) {
	if (shortened)
		fwidth = fwidth - 4;
	var outimg = new Int32Array(fwidth*fheight/ (outputType == 13 ? 8 : 4));
	blockPosition = 0;
	for (var d = 0; d< getFrameColumns(); d++){
		if (getFrameColumns() > 1)
			var pix = mipmaps[canvas].getContext("2d").getImageData(mipmaps[canvas].width/2/getFrameColumns() - fwidth/2+d*fwidth, 0, fwidth, d == getFrameColumns() -1 ? (frameCount%getFrameRows())*height : getFrameRows()*height);
		else
			var pix = mipmaps[canvas].getContext("2d").getImageData(mipmaps[canvas].width/2 - fwidth/2+d*fwidth, 0, fwidth, fheight);
		if (outputType == 13 || outputType == 15) {

			var progressEl= document.getElementById("progress");
			var quality = parseInt(document.getElementById("dxtquality").value);
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
			
			/*var dith = false;
			if (document.getElementById('ditherCheck').checked) {
				dith = true;
				var dpix = mipmaps[canvas].getContext("2d").getImageData(mipmaps[canvas].width/2 - fwidth/2, 0, fwidth, fheight);
				reduceColors(dpix,5,6,5,8,true);
			}*/
			
			valueTable[canvas] = outimg;
			var position = 0;
			for (var j=0; j<pix.height/4; j++) { // rows of blocks
				for (var i=0; i<fwidth/4; i++) { // columns of blocks
				blockCount+=1;
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
		}
		else if(outputType == 0) {
			outputImage[canvas] = pix.data;
		}
		else if (outputType == 2) {
			for (var i = 0; i < pix.data.length; i += 4){
				pix.data[i+3] = 255;
			}
			outputImage[canvas] = pix.data;
		}
		else if(outputType == 4) {
			for (var i = 0; i < pix.data.length; i += 4){
				pix.data[i+3] = 255;
			}
			reduceColors(pix, 5, 6, 5, 8, document.getElementById('ditherCheck').checked);
			outputImage[canvas] = pix.data;
		}
		else if(outputType == 21) {
			reduceColors(pix, 5, 5, 5, 1, document.getElementById('ditherCheck').checked);
			outputImage[canvas] = pix.data;
		}
		else if(outputType == 19) {
			reduceColors(pix, 4, 4, 4, 4, document.getElementById('ditherCheck').checked);
			outputImage[canvas] = pix.data;
		}
	}
	mipmaps[canvas].getContext("2d").putImageData(pix,mipmaps[canvas].width/2 - fwidth/2,0);
}

function createVTF() {
	var size = 0;
	if (outputType == 13)
		size = (blockCount*8);
	if (outputType == 15)
		size = (blockCount*16);
	else {
		for (var i = 0; i < outputImage.length; i++){
			size += outputImage[i].length;
		}
	}
	var file = new Uint8Array(size+64);
	console.log("save: "+width+" "+height+" "+ size);
	var header = [86,84,70,0,7,0,0,0,1,0,0,0,64,0,0,0,0,0,0,0,12 + document.getElementById("sampling").value,35-hasMipmaps,0,0,frameCount,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,outputType,0,0,0,hasMipmaps ? getReducedMipmapCount()+1 : 1,13,0,0,0,0,0,1]; // 64B (bare minimum)
	writeShort(header,16, shortened ? width - 4 : width);
	writeShort(header,18, height);
	writeShort(header,24, frameCount);
	for (var i=0; i<header.length; i++) {
		file[i] = header[i];
	}
	if (outputType == 13 || outputType == 15) {
		var pos = 64;
		for (var i = valueTable.length-1; i >= 0; i--){
			var table = valueTable[i];
			for (var j = 0; j < table.length; j++) {
				writeInt(file,pos, table[j],4);
				pos+=4;
			}
		}
	}
	else if (outputType == 0){
		var pos = 64;
		for (var i = outputImage.length-1; i >= 0; i--){
			var data = outputImage[i];
			for (var j = 0; j < data.length; j++){
				file[pos] = data[j];
				pos++;
			}
		}
	}
	else if (outputType == 2){
		var pos = 64;
		for (var i = outputImage.length-1; i >= 0; i--){
			var data = outputImage[i];
			for (var j = 0; j < data.length; j+=4){
				file[pos] = data[j];
				file[pos+1] = data[j+1];
				file[pos+2] = data[j+2];
				pos+=3;
			}
		}
	}
	else if (outputType == 4){
		var pos = 64;
		for (var i = outputImage.length-1; i >= 0; i--){
			var data = outputImage[i];
			for (var j = 0; j < outputImage[i].length; j+=4){
				writeShort(file,pos, ((data[j]>>3)) + ((data[j+1]>>2) << 5) + ((data[j+2]>>3 )<< 11));
				pos+=2;
			}
		}
	}
	else if (outputType == 21){
		var pos = 64;
		for (var i = outputImage.length-1; i >= 0; i--){
			var data = outputImage[i];
			for (var j = 0; j < outputImage[i].length; j+=4){
				writeShort(file,pos, ((data[j]>>3) << 10) + ((data[j+1]>>3) << 5) + ((data[j+2]>>3 )) + ((data[j+3] >> 7) << 15));
				pos+=2;
			}
		}
	}
	else if (outputType == 19){
		var pos = 64;
		for (var i = outputImage.length-1; i >= 0; i--){
			var data = outputImage[i];
			for (var j = 0; j < outputImage[i].length; j+=4){
				writeShort(file,pos, ((data[j]>>4) << 8)+ ((data[j+1]>>4) << 4) + ((data[j+2]>>4 )) + ((data[j+3] >> 4) << 12));
				pos+=2;
			}
		}
	}
	download(file, "spray.vtf")
}

//Utils
function getEstFileSize(cmipmaps) {
	var mult = 1;
	if (outputType == 0){
		mult = 4;
	}
	else if (outputType == 13){
		mult = 0.5;
	}
	else if (outputType == 2){
		mult = 3;
	}
	else if (outputType == 4 || outputType == 21 || outputType == 19){
		mult = 2;
	}
	if (cmipmaps && document.getElementById("mipmapsCheck").checked) {
		if (reducedMipmaps)
			mult *= 1.33203125;
		else
			mult *= 1+ (1/3);
	}
	return (shortened ? width - 4 : width) * getTotalImageHeight() * mult + 64;
}

function getTotalImageHeight() {
	return height * frameCount;
}

function getHueDiff(hue1, hue2){
	return 180 - Math.abs(Math.abs(hue1 - hue2) - 180);
}

function getHue(red, green, blue){
	var min = Math.min(Math.min(red, green),blue);
	var max = Math.max(Math.max(red, green),blue);
	if (min == max)
		return 0;
	
	if (max == red){
		hue = (green - blue)/(max - min);
	}
	else if (max == green){
		hue = 2 + (blue - red)/(max - min);
	}
	else if (max == blue){
		hue = 4 + (red - green)/(max - min);
	}
	hue *= 60;
	return hue;
}

function handleGifLoad(gif, cframes) {
	singleImageAnim = false;
	var time = 0;
	for (var j = 0; j < gif.get_frames().length; j++){
		var canvas = document.createElement('canvas');
		canvas.width = gif.get_hdr().width;
		canvas.height = gif.get_hdr().height;
		canvas.getContext('2d').putImageData(gif.get_frames()[j].data,0,0);
		var am = Math.floor((time + gif.get_frames()[j].delay) / 20) - Math.floor(time  / 20);
		if (!document.getElementById("gifCheck").checked)
			am = 1;
		for (var k = 0; k < am; k++){
			if (cframes == frames[0]){
				imagesLoaded++;
				frameCount++;
				if (getEstFileSize() / 1024 > 513){
					if(window.confirm("The remaining "+(gif.get_frames().length - j)+
					" frames will be skipped as it would exceed the frame limit. Press Cancel to preserve all frames")){
						imagesLoaded--;
						frameCount--;
						return;
					}
				}
			}
			else if (cframes.length >= frameCount)
				return;
			cframes.push(canvas);
		}
		time += gif.get_frames()[j].delay;
	}
}

function restoreAlpha(alpha1, alpha2, num){
	if (alpha1 > alpha2)
	switch(num){
		case 0: return alpha1;
		case 1: return alpha2;
		case 2: return (6 * alpha1 + 1 * alpha2) / 7;
		case 3: return (5 * alpha1 + 2 * alpha2) / 7;
		case 4: return (4 * alpha1 + 3 * alpha2) / 7;
		case 5: return (3 * alpha1 + 4 * alpha2) / 7;
		case 6: return (2 * alpha1 + 5 * alpha2) / 7;
		case 7: return (1 * alpha1 + 6 * alpha2) / 7;
	}
	else
	switch (num) {
		case 0: return alpha1;
		case 1: return alpha2;
		case 2: return (4 * alpha1 + 1 * alpha2) / 5;
		case 3: return (3 * alpha1 + 2 * alpha2) / 5;
		case 4: return (2 * alpha1 + 3 * alpha2) / 5;
		case 5: return (1 * alpha1 + 4 * alpha2) / 5;
		case 6: return 0;
		case 7: return 255;
	}
	return 0;
}

function writeShort(data, pos, value){
	data[pos] = value & 0xFF;
	data[pos + 1] = (value >>> 8) & 0xFF;
}

function writeInt(data, pos, value, bytes){
	for (var i = 0; i < bytes; i++) {
		data[pos + i] = (value >>> i*8) & 0xFF;
	}
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

function getColorDiff(color1, color2){
	return Math.abs(color1[0] - color2[0]) + Math.abs(color1[1] - color2[1]) + Math.abs(color1[2] - color2[2]);
}

function getLuminance(red, green, blue){
	if (lumaPow)
		return (0.2126*red*red/255) + (0.7152*green*green/255)+ (0.0722*blue*blue/255);
	else 
		return (0.2126*red) + (0.7152*green)+ (0.0722*blue);
}
