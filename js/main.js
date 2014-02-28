/* ocrad */

var c = document.getElementById('balls'),
	o = c.getContext('2d'),
	count = 0,
	countimg = '';
var nbrtraits = 0;
var $container = $('#imgs');

var canvas, ctx, bMouseIsDown = false, iLastX, iLastY,
    $save, $imgs,
    $convert, $imgW, $imgH,
    $sel;

var pleaserun = false;

var lastWorker;
var worker = new Worker('js/vendor/worker.js')
function runOCR(image_data, raw_feed){
	document.getElementById("output").className = 'processing'
	worker.onmessage = function(e){

		document.getElementById("output").className = ''

		if (typeof e.data === 'string' && e.data !== '' ) {


 			if ( e.data.indexOf("s") == 0 ) {

				var newdiv = document.createElement('div');
				var baliseimg = Canvas2Image.convertToImage(c, c.width, c.height, 'png');

				countimg = "img" + count++;
				newdiv.setAttribute("id", countimg);
				newdiv.setAttribute('class', 'items');
				newdiv.setAttribute('data-traits',  nbrtraits);
		        newdiv.appendChild(baliseimg);
		        $imgs.appendChild(newdiv);
				$("#"+countimg).append("<h3 class='lettre'>" + e.data + "-" + nbrtraits + "</h3>");

				//		console.log(image_data);

					// copie au serveur
	/* 				console.log(image); */

			}

			if('innerText' in document.getElementById("text")){
				document.getElementById("text").innerText = e.data;
			}else{
				document.getElementById("text").textContent = e.data;
				$("#"+countimg).append("<p>" + e.data + "-2</p>");
			}




			$('#' + countimg).click( function () {
				$(this).toggleClass('selected');
			});




		}
		document.getElementById('timing').innerHTML = 'Recognition took ' + ((Date.now() - start)/1000).toFixed(2) + 's';
		runOCRandShow();

	}
	var start = Date.now()
	if(!raw_feed){
		image_data = o.getImageData(0, 0, c.width, c.height);
	}

	worker.postMessage(image_data)
	lastWorker = worker;
}




/* img2canvas */

function init () {
    canvas = document.getElementById('balls');
    ctx = canvas.getContext('2d');
    $save = document.getElementById('save');
    $convert = document.getElementById('convert');
    $sel = document.getElementById('sel');
    $imgs = document.getElementById('imgs');
    $imgW = document.getElementById('imgW');
    $imgH = document.getElementById('imgH');
}

function runOCRandShow() {

	Processing.getInstanceById('balls').cleanSlate();

	if ( pleaserun ) {
		runOCR();
	}
}


onload = init;

$(document).ready( function () {
	$('.exports').click( function () {
		$(this).toggleClass('selected');
	});

	$('#startstop').click( function() {

		if ( !$(this).hasClass('running') ) {
			pleaserun = true;
			$('#startstop').text("&#8595;stop&#8595;");
			runOCRandShow()
		} else {
			$('#startstop').text("&#8595;start&#8595;");
			pleaserun = false;
		}

		$(this).toggleClass('running');

	});


});



