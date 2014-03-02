


$(document).ready( function () {

	for(var i=65;i<=90;i++) {
		$('#imgs').append($('<div/>', {
			"id": String.fromCharCode(i),
			"class": "bloc-lettre",
			"html": "<h3>" + String.fromCharCode(i) + "</h3>",
		}));
	}

	$('.exports').click( function () {
		$(this).toggleClass('selected');
	});

	$('#startstop').click( function() {

		if ( !$(this).hasClass('running') ) {
			pleaserun = true;
			$('#startstop').html("&#8595;stop&#8595;");
			runOCRandShow()
		} else {
			$('#startstop').html("&#8595;start&#8595;");
			pleaserun = false;
		}

		$(this).toggleClass('running');

	});


});



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

		document.getElementById("output").className = '';

		//console.log("e.data : " + e.data + " e.data.charCodeAt(0) : " + e.data.charCodeAt(0));
		//console.log("e.data.length : " + e.data.length );

		if ( e.data.length == 2 ) {
			//console.log("e.data : " + e.data + " e.data.charCodeAt(0) : " + e.data.charCodeAt(0));

			if (typeof e.data === 'string' && e.data !== '' && ( 65 <= e.data.charCodeAt(0) && e.data.charCodeAt(0) <= 90 )) {

				var ocrvalue = e.data;

				if ($('#imgs > #'+ ocrvalue + '').length) {

					var topasteinto = $("#imgs > #"+ ocrvalue);
					var newdiv = $('<div/>', {
										"class": "exp-lettre",
									});

					var baliseimg = Canvas2Image.convertToImage(c, c.width, c.height, 'png');

			        newdiv.append(baliseimg);

					newdiv.children('img').css({
						"left" : ($('#balls').offset().left - topasteinto.offset().left ),
						"top" : ($('#balls').offset().top - topasteinto.offset().top ),
						"opacity" : 0,
					})

/*
					newdiv.css({
						'bottom' : $('#balls').offset().bottom - topasteinto.offset().bottom
					});
*/
			        newdiv.appendTo(topasteinto);
					//console.log( topasteinto.find(".exp-lettre>img") );
					TweenLite.to( topasteinto.find(".exp-lettre>img"), 1, { top:"0", left:"0", opacity: 1,  } );

					//topasteinto.append("<h3 class='lettre'>" + ocrvalue + "-" + nbrtraits + "</h3>");

					//		console.log(image_data);

					newdiv.find("img").click( function () {
						var $this = $(this);
						$(".bloc-lettre").removeClass("lastClicked");
						$this.parent(".bloc-lettre").addClass("lastClicked");
						var animation = new TimelineLite();
						animation.to( $this, .2, {top: "-120px", width: "90%", onComplete:bottomofstack, onCompleteParams:[$this.parent()] })
								.to( $this, .3, {top: "0px", clearProps: "width"});
					});
				}


			}

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

function bottomofstack ($me)
{
	//console.log("$me : " + $me.attr(""));
	$me.parent().append($me);
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

	bezierDrawer.init(canvas, ctx);

}

function runOCRandShow() {

	bezierDrawer.erase(canvas, ctx);
	bezierDrawer.loop(canvas, ctx);
	bezierDrawer.loop(canvas, ctx);

	if ( pleaserun ) {
		runOCR();
	}
}


onload = init;


var bezierDrawer = {
	init : function (canvas, c) {

		c.canvas.width  = 89;
		c.canvas.height = 118;

		c.fillStyle = 'white'
		c.fillRect(0,0,canvas.width,canvas.height)
		console.log(canvas.width);
		c.fillStyle = 'rgb(255,255,255)'
		x1 = canvas.width * Math.random();
		y1 = canvas.height * Math.random();
		x2 = canvas.width * Math.random();
		y2 = canvas.height * Math.random();
		x3 = canvas.width * Math.random();
		y3 = canvas.height * Math.random();
		x4 = canvas.width * Math.random();
		y4 = canvas.height * Math.random();

		decalageX = -3;
		decalageY = +3;

	},

	loop : function (canvas, c) {
		c.beginPath()
		c.lineWidth = 5

		x1 = x4;
		y1 = y4;
		x2 = canvas.width * Math.random();
		y2 = canvas.height * Math.random();
		x3 = canvas.width * Math.random();
		y3 = canvas.height * Math.random();
		x4 = canvas.width * Math.random();
		y4 = canvas.height * Math.random();

/*
		c.moveTo(x1, y1)
		c.bezierCurveTo( x2, y2, x3, y3, x4, y4);
		c.moveTo( x4 + decalageX, y4 + decalageY);
		c.bezierCurveTo( x3 + decalageX, y3 + decalageY, x2 + decalageX, y2 + decalageY, x1 + decalageX, y1 + decalageY);
		c.moveTo(x1, y1)
*/
		c.moveTo(x1, y1)
		c.bezierCurveTo( x2, y2, x3, y3, x4, y4);

		c.strokeStyle = "rgb(0,0,0)";
		c.stroke();

	},

	erase : function (canvas, c) {
		c.fillStyle = 'rgb(255,255,255)'
		c.fillRect(0,0,canvas.width,canvas.height)

	},
};