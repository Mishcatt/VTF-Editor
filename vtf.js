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
var forceDither = false;
var lumaPow = false;
var colorDifference = 0;
var cresizer = document.createElement('canvas');
var mipmapclick = false;
var outdxt;
var onImportClipAccept;
var largestResolution = 1024;
var autores = false;
var fastSeekEnabled = typeof document.createElement('video').fastSeek != "undefined";
var convertWorkersLeft = 0;
var timestart = 0;
var convertWorkers = [];

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
	autores = false;
	document.getElementById('saveButton').disabled = true;
	document.getElementById('files0').disabled = true;
	document.getElementById("mipmaps").innerHTML = "";
	document.getElementById("resolutionNotice").style.visibility = "hidden";
	if (document.getElementById("widthSetting").value == "custom"){
		width = parseInt(document.getElementById("widthSettingCus").value);
		document.getElementById("widthSettingCus").style.display = "inline";
	}
	else if (document.getElementById("widthSetting").value == "auto") {
		width = largestResolution;
		autores = true;
		document.getElementById("widthSettingCus").style.display = "none";
	}
	else {
		width = parseInt(document.getElementById("widthSetting").value);
		document.getElementById("widthSettingCus").style.display = "none";
	}
	if (document.getElementById("heightSetting").value == "custom"){
		height = parseInt(document.getElementById("heightSettingCus").value);
		document.getElementById("heightSettingCus").style.display = "inline";
	}
	else if (document.getElementById("heightSetting").value == "auto") {
		height = largestResolution;
		autores = true;
		document.getElementById("heightSettingCus").style.display = "none";
	}
	else {
		height = parseInt(document.getElementById("heightSetting").value);
		document.getElementById("heightSettingCus").style.display = "none";
	}
	while (autores && getEstFileSize(false)/1024 > 513 && width >= 8 && height >= 8){
		width /=2;
		height/=2;
		check();
	}
	
	mipmaps[0].width = width;
	mipmaps[0].height = height;
	document.getElementById('preview').getContext("2d").clearRect(0,0,width,height);
	document.getElementById("contentWrapper").style.width = width+"px";
	document.getElementById("contentWrapper").style.height = height+"px";
	document.getElementById("files").value = "";
	mipmaps[0].getContext("2d").clearRect(0,0,width,height);
	onPropertyChange();
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
	if (getEstFileSize(false)/1024 >= 385 || shortened || document.getElementById("sampling").value == 1 || width % 64 != 0 || height % 64 != 0){
		document.getElementById("mipmapsCheck").disabled = true;
		document.getElementById("mipmapsCheck").checked = false;
	}
	else{
		if (!mipmapclick)
			document.getElementById("mipmapsCheck").checked = true;
		document.getElementById("mipmapsCheck").disabled = false;
	}
	reducedMipmaps = getEstFileSize(false)/1024 >= 384;
	showMipmap(document.getElementById("mipmapsCheck"));
}

function onPropertyChange() {
	check();
	if (frames.length > 0){
		createCanvas();
		convert();
	}
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
  document.getElementById('outputFilename').value = 'spray';
	document.getElementById('saveButton').disabled = true;
	document.getElementById('files0').disabled = true;
	
	imagesLoaded = 0;
	frames = [];
	frames[0] = [];
	currFrame = 0;
	frameCount = files.length;
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
					if (this.fileType == "image/gif" && i == 0){
						frameCount = 0;
						var gif = new SuperGif( {gif: img, auto_play: false});
						gif.load_raw(new Uint8Array(e.target.result), function (el) {
							document.body.style.cursor = "auto";
							updateHighestResolution(gif.get_hdr().width, gif.get_hdr().height,gif.get_frames().length); 
							handleClipImport(gif.get_frames().length, false, function (options){
								handleGifLoad(gif, frames[0],options); 
								updateHighestResolution(gif.get_hdr().width, gif.get_hdr().height,frameCount); 
								onPropertyChange();
								closeClipImport();
							});
						});
					}
					else if (this.fileType == "image/x-tga" || this.fileType == "image/targa"){
						var tga = new TGA();
						tga.load(new Uint8Array(e.target.result));
						if (singleImageAnim)
							frameCount = tga.header.height / height;
						imagesLoaded += 1;
						frames[0].push(tga.getCanvas());
						if (imagesLoaded == frameCount) {
							updateHighestResolution(tga.header.width, tga.header.height,frameCount);
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
								updateHighestResolution(img.width, img.height,frameCount);
								check();
								createCanvas();
								document.body.style.cursor = "auto";
							}
						}
					}
					setTimeout(100,() => {
						onPropertyChange();
					})
				});
			
			if (files[i].type == "image/gif" || files[i].type == "image/x-tga" || files[i].type == "image/targa"){
				reader.readAsArrayBuffer(files[i]);
				if (files[i].type == "image/gif")
					break;
			}
			else
				reader.readAsDataURL(files[i]);
			
		}
		else if (i == 0 && files[i].type.match('video.*')){
			handleVideoLoadPre(files[i], function(){
				var video = this;
				frameCount = 0;
				
				document.body.style.cursor = "auto";
				handleClipImport(this.duration, true, function (options){
					document.body.style.cursor = "url(img/aero_derpy_busy.ani), wait";
					reduceVideoSize(options,video);
					updateHighestResolution(options.width, options.height,(options.end-options.start)/options.frametime);
					handleVideoLoad(video, frames[0],options, (progress) => {if (progress >= 1) {
						URL.revokeObjectURL(video.src);
						onPropertyChange(); closeClipImport(); document.body.style.cursor = "auto";
					}else{
						document.getElementById("videoImporterProg").innerText=Math.round(progress*100)+"%";
					}});  
				});
			})
			break;
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
	if (frames.length == 0 || frames[0].length == 0)
		return;
	mipmapCount = 0;
	generateCanvas(0, width, height);
	generatePreview(0, width, height);
	var mipwidth = width;
	var mipheight = getTotalImageHeight();
	var mipmapsHTML = "";
	//hasMipmaps = 1;
	for (var i=2; (width/i>16) && (height/i>16) /*&& (width/i) % 4 == 0 && (height/i) % 4 == 0*/; i*=2) {
		mipmapCount++;
		mipmaps.push(document.createElement('canvas'));
		mipmapsHTML += "<div id=\"inputWrapper"+mipmapCount+"\"></div>\n<canvas class=\"mipmapElement\" id=\"canvasMipmap"+mipmapCount+"\"></canvas><br /><input type=\"file\" id=\"files"+mipmapCount+"\" name=\"files[]\" accept=\"image/*,.tga,video/*\" onchange=\"changeMipmap(event,"+mipmapCount+")\" multiple/>\n";
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
	if (convertWorkersLeft > 0) {
		convertWorkersLeft = 0;
		for(var i = 0; i < convertWorkers.length; i++) {
			convertWorkers[i].terminate();
		}
		convertWorkers = [];
	}
	blockPosition = 0;
	document.body.style.cursor = "url(img/aero_derpy_busy.ani), wait";
	timestart = performance.now();
	//
	blockCount = 0;
	if (hasMipmaps)
		for (var i=getReducedMipmapCount(); i>0; i--) convertPixels(i,width/(Math.pow(2,i)),getTotalImageHeight()/(Math.pow(2,i)));
	convertPixels(0, width, getTotalImageHeight());
}



function changeMipmap(evt,mipmapNumber) { // this code, it scares me
	var files = evt.target.files; // FileList object
	if (files.length == 0)
		return;

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
					if (this.fileType == "image/gif" && i == 0){
						var gif = new SuperGif( {gif: img, auto_play: false});
						gif.load_raw(new Uint8Array(e.target.result), function (el) {
							handleClipImport(gif.get_frames().length, false, function (options){
								handleGifLoad(gif, frames[mipmapNumber],options); loadMipmaps(mipmapNumber, cwidth, cheight); closeClipImport();
							});
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
		else if (i == 0 && files[i].type.match('video.*')){
			handleVideoLoadPre(files[i], function(){
				var video = this;
				handleClipImport(this.duration, true, function (options){
					document.body.style.cursor = "url(img/aero_derpy_busy.ani), wait";
					reduceVideoSize(options,video);
					handleVideoLoad(video, frames[mipmapNumber],options, (progress) => {if (progress >= 1) {
						closeClipImport();loadMipmaps(mipmapNumber, cwidth, cheight); document.body.style.cursor = "auto";
					}else{
						document.getElementById("videoImporterProg").innerText=Math.round(progress*100)+"%";
					}});  
				});
			})
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
	onPropertyChange();
	document.body.style.cursor = "auto";
}

function getReducedMipmapCount() {
	/*if (reducedMipmaps){
		return Math.min(4, mipmapCount);
	}*/
	return mipmapCount;
}
function setOutputType(el){
	if (el.value != outputType) {
		outputType = el.value;
		onPropertyChange();
	}
	if (el.value != 0 && el.value != 2 && el.value != 13 && el.value != 15)
		document.getElementById('ditherBlock').style.display = "block";
	else
		document.getElementById('ditherBlock').style.display = "none";

	if (el.value == 13 || el.value == 15){
		document.getElementById('dxtSettings').style.display = "block";
	}
	else
		document.getElementById('dxtSettings').style.display = "none";
	
}


function getWorkerCount(fheight) {
	return Math.min(navigator.hardwareConcurrency,Math.ceil(fheight / 64));
}

function convertPixels(canvas, fwidth, fheight) {
	if (shortened)
		fwidth = fwidth - 4;
	
	
	
	blockPosition = 0;
	var isdxt = outputType == 13 || outputType == 15;
	var origpixels = fwidth*fheight;
	if (isdxt) {
		fwidth = Math.ceil(fwidth/4)*4;
		fheight = Math.ceil(fheight/4)*4;
		blockCount += Math.ceil(fwidth/4)*Math.ceil(fheight/4);
	}
	console.log("cwidth "+mipmaps[canvas].width +" fwidth "+fwidth);

	outputImage[canvas] = [];
	valueTable[canvas] = [];

	for (var d = 0; d< getFrameColumns(); d++){
		var columnHeight = fheight;

		//Image exceeds max height, needs to be split into multiple columns
		if (getFrameColumns() > 1)
			columnHeight = d == getFrameColumns() - 1 ? (frameCount%getFrameRows())*height : getFrameRows()*height;
			
		var workerCount = getWorkerCount(columnHeight);

		var stripHeight = Math.ceil(columnHeight/workerCount/4)*4;
		var stripStart = 0;

		for (var strip = 0; strip < workerCount; strip++) {

			if (strip == workerCount - 1)
				stripHeight = columnHeight - stripStart;

			var pix = mipmaps[canvas].getContext("2d").getImageData(mipmaps[canvas].width/2/getFrameColumns() - fwidth/2+d*fwidth, stripStart, fwidth, stripHeight);
		
			convertWorkersLeft += 1;
			if (convertWorkers.length <= strip)
				convertWorkers.push(new Worker("./convert.js"));
			let convertWorker = convertWorkers[strip];
			
			message = {};
			message.frameColumn = d;
			message.canvas = canvas;
			message.fwidth = fwidth;
			message.fheight = fheight;
			message.outputType = outputType;
			message.frameColumns = getFrameColumns();
			message.imageData = pix;
			message.quality = parseInt(document.getElementById("dxtquality").value);
			message.dither = document.getElementById('ditherCheck').checked;
			message.stripStart = stripStart;
			message.stripHeight = stripHeight;
			message.strip = strip * getFrameColumns() + d;
			
			convertWorker.postMessage(message); 
			convertWorker.onmessage = e => {
				onConvertFragment(e.data);
			};

			stripStart += stripHeight;
		}
	}
	
}

function onConvertFragment(data) {
	outputImage[data.canvas][data.strip] = data.pix.data;
	valueTable[data.canvas][data.strip] = data.valueTable;
	console.log(data.canvas);
	mipmaps[data.canvas].getContext("2d").putImageData(data.pix,mipmaps[data.canvas].width/2/getFrameColumns() - data.fwidth/2 + data.frameColumn * data.fwidth, data.stripStart);
	convertWorkersLeft -= 1;
	if (convertWorkersLeft <= 0) {
		onFinishConvert();
	}
}

function onFinishConvert() {

	converted = true;
	//document.getElementById('inputWrapper').style.display = "none";
	document.getElementById('saveButton').disabled = false;
	document.getElementById('saveButtonVMT').disabled = false;
	document.getElementById('files0').disabled = false;
	document.body.style.cursor = "auto";
	generatePreview(0,width, height);
	console.log("time elapsed "+(performance.now() - timestart));
}

function createVTF() {
	var size = 0;
	
	if (outputType == 13)
		size = (blockCount*8);
	else if (outputType == 15)
		size = (blockCount*16);
	else {
		for (var i = 0; i < outputImage.length; i++){
			var stripdata = outputImage[i];
			for (var j = 0; j < stripdata.length; j++){
				size += stripdata[j].length;
			}
		}
	}
	var file = new Uint8Array(size+64);
	
	console.log("save: "+width+" "+height+" "+ size);
	var header = [86,84,70,0,7,0,0,0,1,0,0,0,64,0,0,0,0,0,0,0,12 + parseInt(document.getElementById("sampling").value),35-hasMipmaps,0,0,frameCount,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,outputType,0,0,0,hasMipmaps ? getReducedMipmapCount()+1 : 1,13,0,0,0,0,0,1]; // 64B (bare minimum)
	writeShort(header,16, shortened ? width - 4 : width);
	writeShort(header,18, height);
	writeShort(header,24, frameCount);
	for (var i=0; i<header.length; i++) {
		file[i] = header[i];
	}
	if (outputType == 13 || outputType == 15) {
		var pos = 64;
		for (var i = valueTable.length-1; i >= 0; i--){
			var striptable = valueTable[i];
			for (var j = 0; j < striptable.length; j++) {
				var table = striptable[j];
				for (var k = 0; k < table.length; k++) {
					writeInt(file,pos, table[k],4);
					pos+=4;
				}
			}
		}
	}
	else if (outputType == 0){
		var pos = 64;
		for (var i = outputImage.length-1; i >= 0; i--){
			var stripdata = outputImage[i];
			for (var j = 0; j < stripdata.length; j++){
				var data = stripdata[j];
				for (var k = 0; k < data.length; k++){
					file[pos] = data[k];
					pos++;
				}
			}
		}
	}
	else if (outputType == 2){
		var pos = 64;
		for (var i = outputImage.length-1; i >= 0; i--){
			var stripdata = outputImage[i];
			for (var j = 0; j < stripdata.length; j+=1){
				var data =stripdata[j];
				for (var k = 0; k < data.length; k+=4){
					file[pos] = data[k];
					file[pos+1] = data[k+1];
					file[pos+2] = data[k+2];
					pos+=3;
				}
			}
		}
	}
	else if (outputType == 4){
		var pos = 64;
		for (var i = outputImage.length-1; i >= 0; i--){
			var stripdata = outputImage[i];
			for (var j = 0; j < stripdata.length; j+=1){
				var data =stripdata[j];
				for (var k = 0; k < data.length; k+=4){
					writeShort(file,pos, ((data[k]>>3)) + ((data[k+1]>>2) << 5) + ((data[k+2]>>3 )<< 11));
					pos+=2;
				}
			}
		}
	}
	else if (outputType == 21){
		var pos = 64;
		for (var i = outputImage.length-1; i >= 0; i--){
			var stripdata = outputImage[i];
			for (var j = 0; j < stripdata.length; j+=1){
				var data =stripdata[j];
				for (var j = 0; j < data.length; j+=4){
					writeShort(file,pos, ((data[k]>>3) << 10) + ((data[k+1]>>3) << 5) + ((data[k+2]>>3 )) + ((data[k+3] >> 7) << 15));
					pos+=2;
				}
			}
		}
	}
	else if (outputType == 19){
		var pos = 64;
		for (var i = outputImage.length-1; i >= 0; i--){
			var stripdata = outputImage[i];
			for (var j = 0; j < stripdata.length; j+=1){
				var data =stripdata[j];
				for (var k = 0; k < data.length; k+=4){
					writeShort(file,pos, ((data[k]>>4) << 8)+ ((data[k+1]>>4) << 4) + ((data[k+2]>>4 )) + ((data[k+3] >> 4) << 12));
					pos+=2;
				}
			}
		}
	}
	download(file, "vtf");
	//var link = document.createElement('a');
	//link.download = 'filename.png';
	//link.href = mipmaps[0].toDataURL();
	//link.click();
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
		mult *= 1.33203125;
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

function handleGifLoad(gif, cframes,options) {
	singleImageAnim = false;
	var time = 0;
	var frametime = options.frametime * 100;

	var cancelPressed = false;
	for (var j = options.start; j < options.end; j++){
		var canvas = document.createElement('canvas');
		canvas.width = gif.get_hdr().width;
		canvas.height = gif.get_hdr().height;
		canvas.getContext('2d').putImageData(gif.get_frames()[j].data,0,0);
		var am = Math.ceil((time + gif.get_frames()[j].delay) / frametime) - Math.ceil(time  / frametime);
		if (options.allFrames)
			am = 1;
		for (var k = 0; k < am; k++){
			if (cframes == frames[0]){
				imagesLoaded++;
				frameCount++;
				if (!autores && !cancelPressed && getEstFileSize() / 1024 > 513){
					if(window.confirm("The remaining "+(gif.get_frames().length - j)+
					" frames are skipped as they would exceed the frame limit. Press Cancel to preserve all frames")){
						imagesLoaded--;
						frameCount--;
						return;
					}
					else{
						cancelPressed = true;
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

function handleVideoLoadPre(file, onLoad) {
	var video = document.createElement("video");
	video.src = URL.createObjectURL(file);
	video.addEventListener('loadedmetadata', onLoad);
	
	
	return video;
}

function handleVideoLoad(video, cframes, options, onprogress) {
	singleImageAnim = false;
	
	if (fastSeekEnabled)
		video.fastSeek(video.currentTime+options.frametime);
	else
		video.currentTime=options.start;

	var framesc = (options.end-options.start)/options.frametime;
	var cancelPressed = false;
	var times = 0;
	video.addEventListener('timeupdate',function () {
		this.pause();
		times++;
		if (times == 2) {
			if (fastSeekEnabled)
				video.fastSeek(video.currentTime+0.001);
			else
				video.currentTime+=0.001;
			return;
		}
		
		if (frameCount/framesc >= 1){
			return;
		}
		console.log(this.currentTime);
		var canvas = document.createElement('canvas');
		canvas.width = options.width;
		canvas.height = options.height;
		canvas.getContext('2d').drawImage(video,0,0,options.width,options.height);
		
		if (cframes == frames[0]){
			imagesLoaded++;
			frameCount++;
			
			if (!autores && !cancelPressed && getEstFileSize() / 1024 > 513){
				if(window.confirm("The remaining frames are skipped as they would exceed the frame limit. Press Cancel to preserve all frames")){
					imagesLoaded--;
					frameCount--;
					framesc=frameCount;
					onprogress(frameCount/framesc);
					return;
				}
				else{
					cancelPressed = true;
				}
			}
		}
		else if (cframes.length >= frameCount){
			framesc=frameCount;
			onprogress(frameCount/framesc);
			return;
		}
		cframes.push(canvas);
		onprogress(frameCount/framesc);
		if (fastSeekEnabled)
			video.fastSeek(video.currentTime+options.frametime);
		else
			video.currentTime+=options.frametime;
	});
	
	video.play();
	return video;
}

function handleClipImport(length, usetime, clipAccept) {
	document.getElementById("videoImporterAccept").disabled=false;
	document.getElementById("main").style.display="none";
	document.getElementById("videoImporter").style.display="block";
	document.getElementById("startTimeIn").value=0;
	document.getElementById("endTimeIn").value=length;
	document.getElementById("videoImporterProg").innerText="";
	if (usetime){
		document.getElementById("startTimeLb").innerText="Start time in seconds:"
		document.getElementById("endTimeLb").innerText="End time in seconds:"
		document.getElementById("videoImporterNotice").style.display="block";
		document.getElementById("allFramesIn").style.display="none";
		document.getElementById("allFramesLb").style.display="none";
	}
	else{
		document.getElementById("startTimeLb").innerText="Start frame:"
		document.getElementById("endTimeLb").innerText="End frame:"
		document.getElementById("videoImporterNotice").style.display="none";
		document.getElementById("allFramesIn").style.display="inline";
		document.getElementById("allFramesLb").style.display="inline";
	}
	document.getElementById("fpsIn").value=1;
	onImportClipAccept = clipAccept;
}

function clipImport() {
	this.disabled = true;
	var options = {};
	options.start=parseFloat(document.getElementById("startTimeIn").value);
	options.end=parseFloat(document.getElementById("endTimeIn").value);
	options.frametime=parseFloat(document.getElementById("fpsIn").value)/5;
	options.allFrames=document.getElementById("allFramesIn").checked;
	onImportClipAccept(options);
	
}

function closeClipImport(){
	document.getElementById("main").style.display="block";
	document.getElementById("videoImporter").style.display="none";
}

function reduceVideoSize(options,video){
	var maxres=8192;
	var framesc = (options.end-options.start)/options.frametime;
	if (framesc > 8192){
		maxres=16;
	}
	else if (framesc > 2048){
		maxres=32;
	}
	else if (framesc > 512){
		maxres=64;
	}
	else if (framesc > 128){
		maxres=128;
	}
	else if (framesc > 32){
		maxres=256;
	}
	else if (framesc > 8){
		maxres=512;
	}
	else if (framesc > 2){
		maxres=1024;
	}
	var scale=Math.min(1,maxres/Math.max(video.videoWidth,video.videoHeight));
	options.width=video.videoWidth*scale;
	options.height=video.videoHeight*scale;
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

// Function to download data to a file
function download(data, extension) {
    var nameField = document.getElementById("outputFilename");
    if (!nameField.validity.valid) {
      alert("Filename contains invalid characters");
      return;
    }
    var a = document.createElement("a"),
        file = new Blob([data], {type: "application/octet-stream"}),
        name = nameField.value || "spray",
        filename = name + "." + extension;
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

function updateHighestResolution(width,height, framesc){
	var maxres =Math.max(width,height);

	if (framesc > 16384 && maxres > 4){
		maxres=4;
	}
	else if (framesc > 4096 && maxres > 8){
		maxres=8;
	}
	else if (framesc > 1024 && maxres > 16){
		maxres=16;
	}
	else if (framesc > 256 && maxres > 32){
		maxres=32;
	}
	else if (framesc > 64 && maxres > 64){
		maxres=64;
	}
	else if (framesc > 16 && maxres > 128){
		maxres=128;
	}
	else if (framesc > 4 && maxres > 256){
		maxres=256;
	}
	else if (framesc > 1 && maxres > 512){
		maxres=512;
	}
	for (var i=4;i <= 1024; i*=2){
		if (i >= maxres || i == 1024) {
			largestResolution = i;
			break;
		}
	}
	if (autores)
		setResolution();
}

function downloadVMT(){
	var vmtName = document.getElementById("outputFilename").value;
	var vmtFileText = `"UnlitGeneric"
{
	"$basetexture"	"vgui/logos/${vmtName}"
	"$translucent" "1"
	"$ignorez" "1"
	"$vertexcolor" "1"
	"$vertexalpha" "1"
}`;
	download(vmtFileText, "vmt");
}
