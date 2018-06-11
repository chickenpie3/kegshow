

function updateGlass(destctx, fill, srm) {

	if (fill <= 0) {
		return;
	}

	//let ctx = offscreenCanvas.getContext('2d');
	let ctx = destctx;

    ctx.save();

	//fill = (fill + 114000.0)/1000.0;

	var height = 121;
	var topWidth = 88;
	var bottomWidth = 62;
	var slope = (topWidth/2 - bottomWidth/2) / height;
	var offset = (topWidth - bottomWidth) / 2;
	var head = fill * height * 0.15;
	var h1x = offset * (1-fill);
	var h1y = height * (1-fill);
	var h2x = slope * (head) + h1x;
	var h2y = h1y + head;
	var b1x = h2x;
	var b1y = h2y;
	var b2x = offset;
	var b2y = height;

    // head
	ctx.beginPath();
	ctx.fillStyle = 'rgb(255,255,255)';
	ctx.moveTo(h1x, h1y);
	ctx.lineTo(h2x, h2y);
	ctx.lineTo(topWidth - h2x, h2y);
	ctx.lineTo(topWidth - h1x, h1y);
	ctx.closePath();
	ctx.fill();

    // liquid
	ctx.beginPath();
	ctx.lineJoin = 'miter';
	ctx.lineCap = 'butt';
	ctx.miterLimit = 4;
	ctx.lineWidth = 4;
	ctx.fillStyle = getRGBforSRM(srm);
	ctx.moveTo(b1x, b1y);
	ctx.lineTo(b2x, b2y);
	ctx.lineTo(topWidth - b2x, b2y);
	ctx.lineTo(topWidth - b1x, b1y);
	ctx.closePath();
	ctx.fill();

	ctx.restore();
}

function renderGlass(destctx, fill, srm, width, height) {

	//let ctx = offscreenCanvas.getContext('2d');
	let ctx = destctx;

	//var f = fill;
    //fill = (fill + 114000.0)/1000.0;

    if (fill < 0) {
    	fill = 0;
    } else if (fill >1) {
    	fill = 1;
    }

	//var height = 121;
	var topWidth = width; //88
	var slope = 13.0/121.0; // (topWidth/2 - bottomWidth/2) / height;
	var bottomWidth = topWidth - (slope * height)*2;// 62;
	var offset = (topWidth - bottomWidth) / 2;
	var head = fill * height * 0.15;
	var h1x = offset * (1-fill);
	var h1y = height * (1-fill);
	var h2x = slope * (head) + h1x;
	var h2y = h1y + head;
	var b1x = h2x;
	var b1y = h2y;
	var b2x = offset;
	var b2y = height;

    ctx.save();
	ctx.translate(2,2);

	//glass background
	ctx.beginPath();
	ctx.fillStyle = 'rgb(35,35,35)';
	ctx.moveTo(0, 0);
	ctx.lineTo((topWidth-bottomWidth)/2, height);
	ctx.lineTo((topWidth-bottomWidth)/2 +bottomWidth, height);
	ctx.lineTo(topWidth, 0);
	ctx.closePath();
	ctx.fill();

	//updateGlass(ctx, fill, srm);
	// head
	ctx.beginPath();
	ctx.fillStyle = 'rgb(255,255,255)';
	ctx.moveTo(h1x, h1y);
	ctx.lineTo(h2x, h2y);
	ctx.lineTo(topWidth - h2x, h2y);
	ctx.lineTo(topWidth - h1x, h1y);
	ctx.closePath();
	ctx.fill();

    // liquid
	ctx.beginPath();
	ctx.lineJoin = 'miter';
	ctx.lineCap = 'butt';
	ctx.miterLimit = 4;
	ctx.lineWidth = 4;
	ctx.fillStyle = getRGBforSRM(srm);
	ctx.moveTo(b1x, b1y);
	ctx.lineTo(b2x, b2y);
	ctx.lineTo(topWidth - b2x, b2y);
	ctx.lineTo(topWidth - b1x, b1y);
	ctx.closePath();
	ctx.fill();

	//gradient
	var glassGradient = ctx.createLinearGradient(0,0,topWidth,0);
	glassGradient.addColorStop(0, 'rgba(0, 0, 0, 0.50)');
	glassGradient.addColorStop(0.22, 'rgba(127, 127, 127, 0.15)');
	glassGradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.45)');
	glassGradient.addColorStop(0.60, 'rgba(255, 255, 255, 0)');
	glassGradient.addColorStop(0.75, 'rgba(0, 0, 0, 0)');
	glassGradient.addColorStop(1, 'rgba(0, 0, 0, 0.50)');

    // Outer glass
	ctx.beginPath();
	ctx.lineJoin = 'miter';
	ctx.lineCap = 'butt';
	ctx.miterLimit = 4;
	ctx.lineWidth = 2;
	ctx.fillStyle = glassGradient;
	ctx.strokeStyle = glassGradient;
	ctx.moveTo(0, 0);
	ctx.lineTo((topWidth-bottomWidth)/2, height);
	ctx.lineTo((topWidth-bottomWidth)/2 +bottomWidth, height);
	ctx.lineTo(topWidth, 0);
	ctx.closePath();
	ctx.fill();
	ctx.stroke();

    //glass outline
    // ctx.beginPath();
	// ctx.lineJoin = 'miter';
	// ctx.lineCap = 'butt';
	// ctx.miterLimit = 4;
	// ctx.lineWidth = 2;
	// ctx.strokeStyle = glassGradient;
	// ctx.moveTo(0, 0);
	// ctx.lineTo((topWidth-bottomWidth)/2, height);
	// ctx.lineTo((topWidth-bottomWidth)/2 +bottomWidth, height);
	// ctx.lineTo(topWidth, 0);
	// ctx.closePath();
	// ctx.stroke();

	ctx.restore();

	// cut the drawn rectangle
    //let image = ctx.getImageData(0,0,110,143);
    // copy into visual canvas at different position
    //destctx.putImageData(image, 0, 0);
}
