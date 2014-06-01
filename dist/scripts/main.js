(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// annuler le scroll auto au refresh
window.onload = function() {
 setTimeout (function () {
  scrollTo(0,0);
 }, 0);
}
function map_range(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

function calcFlecheScale( windowscroll ) {
		{
			// modifier le scale des flèches : en scrollant vers le bas ".centered.bottom .fleche" voit son scale passer de 1 à -1
			var scaleBottom = ( $("#interface .centered.bottom").offset().top + $("#interface .centered.bottom").height() - windowscroll ) / $(window).height();
			// scaleBottom va de 1 à 0, mais pour retourner la flèche avec le scale il faut de 1 à -1.
			var scaleBottomNew = map_range(scaleBottom, 0, 1, -.4, .4);

			scaleBottomNew = scaleBottomNew > 1 ? 1 : scaleBottomNew;
			scaleBottomNew = scaleBottomNew < -1 ? -1 : scaleBottomNew;

			$("#interface .centered.bottom .fleche").transition({ scale: scaleBottomNew }, { queue: false });
		}

		{
			var scaleTop = ( $("#interface .centered.top").offset().top - windowscroll ) / $(window).height();
			// scaleTop va de 1 à 0, mais pour retourner la flèche avec le scale il faut de 1 à -1.
			var scaleTopNew = map_range(scaleTop, 1, 0, -.4, .4);

			scaleTopNew = scaleTopNew > 1 ? 1 : scaleTopNew;
			scaleTopNew = scaleTopNew < -1 ? -1 : scaleTopNew;

			$("#interface .centered.top .fleche").transition({ scale: scaleTopNew }, { queue: false });
		}


		// fond du body
		$(".container").removeClass("bottom-bound");
		$(".container").removeClass("top-bound");
		if ( scaleBottomNew < 0 ) {
			console.log("<0");
/*
			var valgris = Math.floor( map_range(scaleBottomNew, 0, -.4, 239, 0) );
			console.log("valgris :  " + valgris);
			console.log("rgba(" + valgris + " , " + valgris + " , " + valgris + " , 1)");
			valgris = valgris < 23 ? 23 : valgris;
			$("body").css("background-color", "rgba(" + valgris + "," + valgris + "," + valgris + ",1)");
*/
			$(".container").addClass("bottom-bound");
		} else

		if ( scaleTopNew < 0 ) {
			$(".container").addClass("top-bound");
		}

}


function setInterface() {



	setTimeout (function () {
		// scroller vers
		var scrollInterfaceMiddle = $("#interface").offset().top + ($("#interface").height()/2);
		var scrollInterface = scrollInterfaceMiddle - $(window).height()/2;
		$("body").scrollTop( scrollInterface );
		$("body").addClass("loaded");
		calcFlecheScale( scrollInterface );
	 }, 1000);

	for(var i=65;i<=90;i++) {
		$lettercontainer.append($('<div/>', {
			"id": String.fromCharCode(i),
			"class": "bloc-lettre",
			"html": "<h3>" + String.fromCharCode(i) + "</h3>",
		}));
	}

	for(var i=97;i<=122;i++) {
		$lettercontainer.append($('<div/>', {
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

	$("#showthrough").hover ( function () {
		$lettercontainer.find(".exp-lettre").css("opacity",.02);
	}, function () {
		$lettercontainer.find(".exp-lettre").css("opacity",1);
	});


	$(window).on('scroll', function () {
		// placer le backtotop en vu
		var iconoffsettop = $("#showthrough").offset().top
		var windowscroll = window.pageYOffset;
		if ( windowscroll > iconoffsettop ) {
			$("#showthrough .stickycontainer").addClass("sticky");
		} else {
			$("#showthrough .stickycontainer").removeClass("sticky");
		}

		calcFlecheScale( windowscroll );

	});


}



/* ocrad */

var c = document.getElementById('letters'),
	o = c.getContext('2d'),
	count = 0,
	countimg = '';
var nbrtraits = 0;
var $lettercontainer = $('#imgs #letterOutput');

var canvas, ctx, bMouseIsDown = false, iLastX, iLastY,
    $save, $imgs,
    $convert, $imgW, $imgH,
    $sel;

var pleaserun = false;

var lastWorker;
var worker = new Worker('./scripts/vendor/worker.js')
function runOCR(image_data, raw_feed){
	document.getElementById("output").className = 'processing';
	worker.onmessage = function(e){

		document.getElementById("output").className = '';

		//console.log("e.data : " + e.data + " e.data.charCodeAt(0) : " + e.data.charCodeAt(0));
		//console.log("e.data.length : " + e.data.length );

		if ( e.data.length == 2 ) {
			//console.log("e.data : " + e.data + " e.data.charCodeAt(0) : " + e.data.charCodeAt(0));

			if (typeof e.data === 'string' && e.data !== '' && ( (65 <= e.data.charCodeAt(0) && e.data.charCodeAt(0) <= 90) || (97 <= e.data.charCodeAt(0) && e.data.charCodeAt(0) <= 122) )) {

				var ocrvalue = e.data;

				if ( $lettercontainer.find('#'+ ocrvalue + '').length) {

					var topasteinto = $lettercontainer.find("#"+ ocrvalue);
					var newdiv = $('<div/>', {
										"class": "exp-lettre",
									});

					var baliseimg = Canvas2Image.convertToImage(c, c.width, c.height, 'png');

			        newdiv.append(baliseimg);

					newdiv.children('img').css({
						"left" : ($('#letters').offset().left - topasteinto.offset().left ),
						"top" : ($('#letters').offset().top - topasteinto.offset().top ),
						"opacity" : 1,
					})

/*
					newdiv.css({
						'bottom' : $('#letters').offset().bottom - topasteinto.offset().bottom
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
						animation.to( $this, .2, {top: "-124px", width: "90%", onComplete:bottomofstack, onCompleteParams:[$this.parent()] })
								.to( $this, .4, {top: "0px", clearProps: "width"});
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
    canvas = document.getElementById('letters');
    ctx = canvas.getContext('2d');
    $save = document.getElementById('save');
    $convert = document.getElementById('convert');
    $sel = document.getElementById('sel');
    $imgs = document.getElementById('imgs');
    $imgW = document.getElementById('imgW');
    $imgH = document.getElementById('imgH');

	bezierDrawer.init(canvas, ctx);
	setInterface();
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

		c.fillStyle = 'white';
		c.fillRect(0,0,canvas.width,canvas.height);
		//console.log(canvas.width);
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
		c.beginPath();
		c.lineWidth = 4;

/*
		x1 = x4;
		y1 = y4;
		x2 = canvas.width * Math.random();
		y2 = canvas.height * Math.random();
		x3 = canvas.width * Math.random();
		y3 = canvas.height * Math.random();
		x4 = canvas.width * Math.random();
		y4 = canvas.height * Math.random();
*/

		x1 = bezierDrawer.updateW(x1);
		y1 = bezierDrawer.updateH(y1);
		x2 = bezierDrawer.updateW(x2);
		y2 = bezierDrawer.updateH(y2);
		x3 = bezierDrawer.updateW(x3);
		y3 = bezierDrawer.updateH(y3);
		x4 = bezierDrawer.updateW(x4);
		y4 = bezierDrawer.updateH(y4);

		c.moveTo(x1, y1);
		c.bezierCurveTo( x2, y2, x3, y3, x4, y4);

		c.strokeStyle = "rgb(0,0,0)";
		c.stroke();

	},

	erase : function (canvas, c) {
		c.fillStyle = 'rgb(255,255,255)';
		c.fillRect(0,0,canvas.width,canvas.height);

	},

	updateW : function (value) {
		return (canvas.width * Math.random());
	},

	updateH : function (value) {
		return (canvas.height * Math.random());
	},
};
},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVm9sdW1lcy9KdWRlMi9Vc2Vycy9sb3Vpcy9BQ1RJVkVfUFJPSkVDVFMvMTQwMTBfQlJVVEUtRk9OVC9QUk9EVUNUSU9OL0hUTUwvbm9kZV9tb2R1bGVzL3Boby1kZXZzdGFjay9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1ZvbHVtZXMvSnVkZTIvVXNlcnMvbG91aXMvQUNUSVZFX1BST0pFQ1RTLzE0MDEwX0JSVVRFLUZPTlQvUFJPRFVDVElPTi9IVE1ML3NyYy9zY3JpcHRzL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gYW5udWxlciBsZSBzY3JvbGwgYXV0byBhdSByZWZyZXNoXG53aW5kb3cub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gc2V0VGltZW91dCAoZnVuY3Rpb24gKCkge1xuICBzY3JvbGxUbygwLDApO1xuIH0sIDApO1xufVxuZnVuY3Rpb24gbWFwX3JhbmdlKHZhbHVlLCBsb3cxLCBoaWdoMSwgbG93MiwgaGlnaDIpIHtcbiAgICByZXR1cm4gbG93MiArIChoaWdoMiAtIGxvdzIpICogKHZhbHVlIC0gbG93MSkgLyAoaGlnaDEgLSBsb3cxKTtcbn1cblxuZnVuY3Rpb24gY2FsY0ZsZWNoZVNjYWxlKCB3aW5kb3dzY3JvbGwgKSB7XG5cdFx0e1xuXHRcdFx0Ly8gbW9kaWZpZXIgbGUgc2NhbGUgZGVzIGZsw6hjaGVzIDogZW4gc2Nyb2xsYW50IHZlcnMgbGUgYmFzIFwiLmNlbnRlcmVkLmJvdHRvbSAuZmxlY2hlXCIgdm9pdCBzb24gc2NhbGUgcGFzc2VyIGRlIDEgw6AgLTFcblx0XHRcdHZhciBzY2FsZUJvdHRvbSA9ICggJChcIiNpbnRlcmZhY2UgLmNlbnRlcmVkLmJvdHRvbVwiKS5vZmZzZXQoKS50b3AgKyAkKFwiI2ludGVyZmFjZSAuY2VudGVyZWQuYm90dG9tXCIpLmhlaWdodCgpIC0gd2luZG93c2Nyb2xsICkgLyAkKHdpbmRvdykuaGVpZ2h0KCk7XG5cdFx0XHQvLyBzY2FsZUJvdHRvbSB2YSBkZSAxIMOgIDAsIG1haXMgcG91ciByZXRvdXJuZXIgbGEgZmzDqGNoZSBhdmVjIGxlIHNjYWxlIGlsIGZhdXQgZGUgMSDDoCAtMS5cblx0XHRcdHZhciBzY2FsZUJvdHRvbU5ldyA9IG1hcF9yYW5nZShzY2FsZUJvdHRvbSwgMCwgMSwgLS40LCAuNCk7XG5cblx0XHRcdHNjYWxlQm90dG9tTmV3ID0gc2NhbGVCb3R0b21OZXcgPiAxID8gMSA6IHNjYWxlQm90dG9tTmV3O1xuXHRcdFx0c2NhbGVCb3R0b21OZXcgPSBzY2FsZUJvdHRvbU5ldyA8IC0xID8gLTEgOiBzY2FsZUJvdHRvbU5ldztcblxuXHRcdFx0JChcIiNpbnRlcmZhY2UgLmNlbnRlcmVkLmJvdHRvbSAuZmxlY2hlXCIpLnRyYW5zaXRpb24oeyBzY2FsZTogc2NhbGVCb3R0b21OZXcgfSwgeyBxdWV1ZTogZmFsc2UgfSk7XG5cdFx0fVxuXG5cdFx0e1xuXHRcdFx0dmFyIHNjYWxlVG9wID0gKCAkKFwiI2ludGVyZmFjZSAuY2VudGVyZWQudG9wXCIpLm9mZnNldCgpLnRvcCAtIHdpbmRvd3Njcm9sbCApIC8gJCh3aW5kb3cpLmhlaWdodCgpO1xuXHRcdFx0Ly8gc2NhbGVUb3AgdmEgZGUgMSDDoCAwLCBtYWlzIHBvdXIgcmV0b3VybmVyIGxhIGZsw6hjaGUgYXZlYyBsZSBzY2FsZSBpbCBmYXV0IGRlIDEgw6AgLTEuXG5cdFx0XHR2YXIgc2NhbGVUb3BOZXcgPSBtYXBfcmFuZ2Uoc2NhbGVUb3AsIDEsIDAsIC0uNCwgLjQpO1xuXG5cdFx0XHRzY2FsZVRvcE5ldyA9IHNjYWxlVG9wTmV3ID4gMSA/IDEgOiBzY2FsZVRvcE5ldztcblx0XHRcdHNjYWxlVG9wTmV3ID0gc2NhbGVUb3BOZXcgPCAtMSA/IC0xIDogc2NhbGVUb3BOZXc7XG5cblx0XHRcdCQoXCIjaW50ZXJmYWNlIC5jZW50ZXJlZC50b3AgLmZsZWNoZVwiKS50cmFuc2l0aW9uKHsgc2NhbGU6IHNjYWxlVG9wTmV3IH0sIHsgcXVldWU6IGZhbHNlIH0pO1xuXHRcdH1cblxuXG5cdFx0Ly8gZm9uZCBkdSBib2R5XG5cdFx0JChcIi5jb250YWluZXJcIikucmVtb3ZlQ2xhc3MoXCJib3R0b20tYm91bmRcIik7XG5cdFx0JChcIi5jb250YWluZXJcIikucmVtb3ZlQ2xhc3MoXCJ0b3AtYm91bmRcIik7XG5cdFx0aWYgKCBzY2FsZUJvdHRvbU5ldyA8IDAgKSB7XG5cdFx0XHRjb25zb2xlLmxvZyhcIjwwXCIpO1xuLypcblx0XHRcdHZhciB2YWxncmlzID0gTWF0aC5mbG9vciggbWFwX3JhbmdlKHNjYWxlQm90dG9tTmV3LCAwLCAtLjQsIDIzOSwgMCkgKTtcblx0XHRcdGNvbnNvbGUubG9nKFwidmFsZ3JpcyA6ICBcIiArIHZhbGdyaXMpO1xuXHRcdFx0Y29uc29sZS5sb2coXCJyZ2JhKFwiICsgdmFsZ3JpcyArIFwiICwgXCIgKyB2YWxncmlzICsgXCIgLCBcIiArIHZhbGdyaXMgKyBcIiAsIDEpXCIpO1xuXHRcdFx0dmFsZ3JpcyA9IHZhbGdyaXMgPCAyMyA/IDIzIDogdmFsZ3Jpcztcblx0XHRcdCQoXCJib2R5XCIpLmNzcyhcImJhY2tncm91bmQtY29sb3JcIiwgXCJyZ2JhKFwiICsgdmFsZ3JpcyArIFwiLFwiICsgdmFsZ3JpcyArIFwiLFwiICsgdmFsZ3JpcyArIFwiLDEpXCIpO1xuKi9cblx0XHRcdCQoXCIuY29udGFpbmVyXCIpLmFkZENsYXNzKFwiYm90dG9tLWJvdW5kXCIpO1xuXHRcdH0gZWxzZVxuXG5cdFx0aWYgKCBzY2FsZVRvcE5ldyA8IDAgKSB7XG5cdFx0XHQkKFwiLmNvbnRhaW5lclwiKS5hZGRDbGFzcyhcInRvcC1ib3VuZFwiKTtcblx0XHR9XG5cbn1cblxuXG5mdW5jdGlvbiBzZXRJbnRlcmZhY2UoKSB7XG5cblxuXG5cdHNldFRpbWVvdXQgKGZ1bmN0aW9uICgpIHtcblx0XHQvLyBzY3JvbGxlciB2ZXJzXG5cdFx0dmFyIHNjcm9sbEludGVyZmFjZU1pZGRsZSA9ICQoXCIjaW50ZXJmYWNlXCIpLm9mZnNldCgpLnRvcCArICgkKFwiI2ludGVyZmFjZVwiKS5oZWlnaHQoKS8yKTtcblx0XHR2YXIgc2Nyb2xsSW50ZXJmYWNlID0gc2Nyb2xsSW50ZXJmYWNlTWlkZGxlIC0gJCh3aW5kb3cpLmhlaWdodCgpLzI7XG5cdFx0JChcImJvZHlcIikuc2Nyb2xsVG9wKCBzY3JvbGxJbnRlcmZhY2UgKTtcblx0XHQkKFwiYm9keVwiKS5hZGRDbGFzcyhcImxvYWRlZFwiKTtcblx0XHRjYWxjRmxlY2hlU2NhbGUoIHNjcm9sbEludGVyZmFjZSApO1xuXHQgfSwgMTAwMCk7XG5cblx0Zm9yKHZhciBpPTY1O2k8PTkwO2krKykge1xuXHRcdCRsZXR0ZXJjb250YWluZXIuYXBwZW5kKCQoJzxkaXYvPicsIHtcblx0XHRcdFwiaWRcIjogU3RyaW5nLmZyb21DaGFyQ29kZShpKSxcblx0XHRcdFwiY2xhc3NcIjogXCJibG9jLWxldHRyZVwiLFxuXHRcdFx0XCJodG1sXCI6IFwiPGgzPlwiICsgU3RyaW5nLmZyb21DaGFyQ29kZShpKSArIFwiPC9oMz5cIixcblx0XHR9KSk7XG5cdH1cblxuXHRmb3IodmFyIGk9OTc7aTw9MTIyO2krKykge1xuXHRcdCRsZXR0ZXJjb250YWluZXIuYXBwZW5kKCQoJzxkaXYvPicsIHtcblx0XHRcdFwiaWRcIjogU3RyaW5nLmZyb21DaGFyQ29kZShpKSxcblx0XHRcdFwiY2xhc3NcIjogXCJibG9jLWxldHRyZVwiLFxuXHRcdFx0XCJodG1sXCI6IFwiPGgzPlwiICsgU3RyaW5nLmZyb21DaGFyQ29kZShpKSArIFwiPC9oMz5cIixcblx0XHR9KSk7XG5cdH1cblxuXHQkKCcuZXhwb3J0cycpLmNsaWNrKCBmdW5jdGlvbiAoKSB7XG5cdFx0JCh0aGlzKS50b2dnbGVDbGFzcygnc2VsZWN0ZWQnKTtcblx0fSk7XG5cblx0JCgnI3N0YXJ0c3RvcCcpLmNsaWNrKCBmdW5jdGlvbigpIHtcblxuXHRcdGlmICggISQodGhpcykuaGFzQ2xhc3MoJ3J1bm5pbmcnKSApIHtcblx0XHRcdHBsZWFzZXJ1biA9IHRydWU7XG5cdFx0XHQkKCcjc3RhcnRzdG9wJykuaHRtbChcIiYjODU5NTtzdG9wJiM4NTk1O1wiKTtcblx0XHRcdHJ1bk9DUmFuZFNob3coKVxuXHRcdH0gZWxzZSB7XG5cdFx0XHQkKCcjc3RhcnRzdG9wJykuaHRtbChcIiYjODU5NTtzdGFydCYjODU5NTtcIik7XG5cdFx0XHRwbGVhc2VydW4gPSBmYWxzZTtcblx0XHR9XG5cblx0XHQkKHRoaXMpLnRvZ2dsZUNsYXNzKCdydW5uaW5nJyk7XG5cblx0fSk7XG5cblx0JChcIiNzaG93dGhyb3VnaFwiKS5ob3ZlciAoIGZ1bmN0aW9uICgpIHtcblx0XHQkbGV0dGVyY29udGFpbmVyLmZpbmQoXCIuZXhwLWxldHRyZVwiKS5jc3MoXCJvcGFjaXR5XCIsLjAyKTtcblx0fSwgZnVuY3Rpb24gKCkge1xuXHRcdCRsZXR0ZXJjb250YWluZXIuZmluZChcIi5leHAtbGV0dHJlXCIpLmNzcyhcIm9wYWNpdHlcIiwxKTtcblx0fSk7XG5cblxuXHQkKHdpbmRvdykub24oJ3Njcm9sbCcsIGZ1bmN0aW9uICgpIHtcblx0XHQvLyBwbGFjZXIgbGUgYmFja3RvdG9wIGVuIHZ1XG5cdFx0dmFyIGljb25vZmZzZXR0b3AgPSAkKFwiI3Nob3d0aHJvdWdoXCIpLm9mZnNldCgpLnRvcFxuXHRcdHZhciB3aW5kb3dzY3JvbGwgPSB3aW5kb3cucGFnZVlPZmZzZXQ7XG5cdFx0aWYgKCB3aW5kb3dzY3JvbGwgPiBpY29ub2Zmc2V0dG9wICkge1xuXHRcdFx0JChcIiNzaG93dGhyb3VnaCAuc3RpY2t5Y29udGFpbmVyXCIpLmFkZENsYXNzKFwic3RpY2t5XCIpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQkKFwiI3Nob3d0aHJvdWdoIC5zdGlja3ljb250YWluZXJcIikucmVtb3ZlQ2xhc3MoXCJzdGlja3lcIik7XG5cdFx0fVxuXG5cdFx0Y2FsY0ZsZWNoZVNjYWxlKCB3aW5kb3dzY3JvbGwgKTtcblxuXHR9KTtcblxuXG59XG5cblxuXG4vKiBvY3JhZCAqL1xuXG52YXIgYyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsZXR0ZXJzJyksXG5cdG8gPSBjLmdldENvbnRleHQoJzJkJyksXG5cdGNvdW50ID0gMCxcblx0Y291bnRpbWcgPSAnJztcbnZhciBuYnJ0cmFpdHMgPSAwO1xudmFyICRsZXR0ZXJjb250YWluZXIgPSAkKCcjaW1ncyAjbGV0dGVyT3V0cHV0Jyk7XG5cbnZhciBjYW52YXMsIGN0eCwgYk1vdXNlSXNEb3duID0gZmFsc2UsIGlMYXN0WCwgaUxhc3RZLFxuICAgICRzYXZlLCAkaW1ncyxcbiAgICAkY29udmVydCwgJGltZ1csICRpbWdILFxuICAgICRzZWw7XG5cbnZhciBwbGVhc2VydW4gPSBmYWxzZTtcblxudmFyIGxhc3RXb3JrZXI7XG52YXIgd29ya2VyID0gbmV3IFdvcmtlcignLi9zY3JpcHRzL3ZlbmRvci93b3JrZXIuanMnKVxuZnVuY3Rpb24gcnVuT0NSKGltYWdlX2RhdGEsIHJhd19mZWVkKXtcblx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJvdXRwdXRcIikuY2xhc3NOYW1lID0gJ3Byb2Nlc3NpbmcnO1xuXHR3b3JrZXIub25tZXNzYWdlID0gZnVuY3Rpb24oZSl7XG5cblx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm91dHB1dFwiKS5jbGFzc05hbWUgPSAnJztcblxuXHRcdC8vY29uc29sZS5sb2coXCJlLmRhdGEgOiBcIiArIGUuZGF0YSArIFwiIGUuZGF0YS5jaGFyQ29kZUF0KDApIDogXCIgKyBlLmRhdGEuY2hhckNvZGVBdCgwKSk7XG5cdFx0Ly9jb25zb2xlLmxvZyhcImUuZGF0YS5sZW5ndGggOiBcIiArIGUuZGF0YS5sZW5ndGggKTtcblxuXHRcdGlmICggZS5kYXRhLmxlbmd0aCA9PSAyICkge1xuXHRcdFx0Ly9jb25zb2xlLmxvZyhcImUuZGF0YSA6IFwiICsgZS5kYXRhICsgXCIgZS5kYXRhLmNoYXJDb2RlQXQoMCkgOiBcIiArIGUuZGF0YS5jaGFyQ29kZUF0KDApKTtcblxuXHRcdFx0aWYgKHR5cGVvZiBlLmRhdGEgPT09ICdzdHJpbmcnICYmIGUuZGF0YSAhPT0gJycgJiYgKCAoNjUgPD0gZS5kYXRhLmNoYXJDb2RlQXQoMCkgJiYgZS5kYXRhLmNoYXJDb2RlQXQoMCkgPD0gOTApIHx8ICg5NyA8PSBlLmRhdGEuY2hhckNvZGVBdCgwKSAmJiBlLmRhdGEuY2hhckNvZGVBdCgwKSA8PSAxMjIpICkpIHtcblxuXHRcdFx0XHR2YXIgb2NydmFsdWUgPSBlLmRhdGE7XG5cblx0XHRcdFx0aWYgKCAkbGV0dGVyY29udGFpbmVyLmZpbmQoJyMnKyBvY3J2YWx1ZSArICcnKS5sZW5ndGgpIHtcblxuXHRcdFx0XHRcdHZhciB0b3Bhc3RlaW50byA9ICRsZXR0ZXJjb250YWluZXIuZmluZChcIiNcIisgb2NydmFsdWUpO1xuXHRcdFx0XHRcdHZhciBuZXdkaXYgPSAkKCc8ZGl2Lz4nLCB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFwiY2xhc3NcIjogXCJleHAtbGV0dHJlXCIsXG5cdFx0XHRcdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdHZhciBiYWxpc2VpbWcgPSBDYW52YXMySW1hZ2UuY29udmVydFRvSW1hZ2UoYywgYy53aWR0aCwgYy5oZWlnaHQsICdwbmcnKTtcblxuXHRcdFx0ICAgICAgICBuZXdkaXYuYXBwZW5kKGJhbGlzZWltZyk7XG5cblx0XHRcdFx0XHRuZXdkaXYuY2hpbGRyZW4oJ2ltZycpLmNzcyh7XG5cdFx0XHRcdFx0XHRcImxlZnRcIiA6ICgkKCcjbGV0dGVycycpLm9mZnNldCgpLmxlZnQgLSB0b3Bhc3RlaW50by5vZmZzZXQoKS5sZWZ0ICksXG5cdFx0XHRcdFx0XHRcInRvcFwiIDogKCQoJyNsZXR0ZXJzJykub2Zmc2V0KCkudG9wIC0gdG9wYXN0ZWludG8ub2Zmc2V0KCkudG9wICksXG5cdFx0XHRcdFx0XHRcIm9wYWNpdHlcIiA6IDEsXG5cdFx0XHRcdFx0fSlcblxuLypcblx0XHRcdFx0XHRuZXdkaXYuY3NzKHtcblx0XHRcdFx0XHRcdCdib3R0b20nIDogJCgnI2xldHRlcnMnKS5vZmZzZXQoKS5ib3R0b20gLSB0b3Bhc3RlaW50by5vZmZzZXQoKS5ib3R0b21cblx0XHRcdFx0XHR9KTtcbiovXG5cdFx0XHQgICAgICAgIG5ld2Rpdi5hcHBlbmRUbyh0b3Bhc3RlaW50byk7XG5cdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyggdG9wYXN0ZWludG8uZmluZChcIi5leHAtbGV0dHJlPmltZ1wiKSApO1xuXHRcdFx0XHRcdFR3ZWVuTGl0ZS50byggdG9wYXN0ZWludG8uZmluZChcIi5leHAtbGV0dHJlPmltZ1wiKSwgMSwgeyB0b3A6XCIwXCIsIGxlZnQ6XCIwXCIsIG9wYWNpdHk6IDEsICB9ICk7XG5cblx0XHRcdFx0XHQvL3RvcGFzdGVpbnRvLmFwcGVuZChcIjxoMyBjbGFzcz0nbGV0dHJlJz5cIiArIG9jcnZhbHVlICsgXCItXCIgKyBuYnJ0cmFpdHMgKyBcIjwvaDM+XCIpO1xuXG5cdFx0XHRcdFx0Ly9cdFx0Y29uc29sZS5sb2coaW1hZ2VfZGF0YSk7XG5cblx0XHRcdFx0XHRuZXdkaXYuZmluZChcImltZ1wiKS5jbGljayggZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0dmFyICR0aGlzID0gJCh0aGlzKTtcblx0XHRcdFx0XHRcdCQoXCIuYmxvYy1sZXR0cmVcIikucmVtb3ZlQ2xhc3MoXCJsYXN0Q2xpY2tlZFwiKTtcblx0XHRcdFx0XHRcdCR0aGlzLnBhcmVudChcIi5ibG9jLWxldHRyZVwiKS5hZGRDbGFzcyhcImxhc3RDbGlja2VkXCIpO1xuXHRcdFx0XHRcdFx0dmFyIGFuaW1hdGlvbiA9IG5ldyBUaW1lbGluZUxpdGUoKTtcblx0XHRcdFx0XHRcdGFuaW1hdGlvbi50byggJHRoaXMsIC4yLCB7dG9wOiBcIi0xMjRweFwiLCB3aWR0aDogXCI5MCVcIiwgb25Db21wbGV0ZTpib3R0b21vZnN0YWNrLCBvbkNvbXBsZXRlUGFyYW1zOlskdGhpcy5wYXJlbnQoKV0gfSlcblx0XHRcdFx0XHRcdFx0XHQudG8oICR0aGlzLCAuNCwge3RvcDogXCIwcHhcIiwgY2xlYXJQcm9wczogXCJ3aWR0aFwifSk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblxuXG5cdFx0XHR9XG5cblx0XHR9XG5cblx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGltaW5nJykuaW5uZXJIVE1MID0gJ1JlY29nbml0aW9uIHRvb2sgJyArICgoRGF0ZS5ub3coKSAtIHN0YXJ0KS8xMDAwKS50b0ZpeGVkKDIpICsgJ3MnO1xuXHRcdHJ1bk9DUmFuZFNob3coKTtcblxuXHR9XG5cdHZhciBzdGFydCA9IERhdGUubm93KClcblx0aWYoIXJhd19mZWVkKXtcblx0XHRpbWFnZV9kYXRhID0gby5nZXRJbWFnZURhdGEoMCwgMCwgYy53aWR0aCwgYy5oZWlnaHQpO1xuXHR9XG5cblx0d29ya2VyLnBvc3RNZXNzYWdlKGltYWdlX2RhdGEpXG5cdGxhc3RXb3JrZXIgPSB3b3JrZXI7XG59XG5cbmZ1bmN0aW9uIGJvdHRvbW9mc3RhY2sgKCRtZSlcbntcblx0Ly9jb25zb2xlLmxvZyhcIiRtZSA6IFwiICsgJG1lLmF0dHIoXCJcIikpO1xuXHQkbWUucGFyZW50KCkuYXBwZW5kKCRtZSk7XG59XG5cblxuLyogaW1nMmNhbnZhcyAqL1xuXG5mdW5jdGlvbiBpbml0ICgpIHtcbiAgICBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbGV0dGVycycpO1xuICAgIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgICRzYXZlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NhdmUnKTtcbiAgICAkY29udmVydCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb252ZXJ0Jyk7XG4gICAgJHNlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZWwnKTtcbiAgICAkaW1ncyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbWdzJyk7XG4gICAgJGltZ1cgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW1nVycpO1xuICAgICRpbWdIID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ltZ0gnKTtcblxuXHRiZXppZXJEcmF3ZXIuaW5pdChjYW52YXMsIGN0eCk7XG5cdHNldEludGVyZmFjZSgpO1xufVxuXG5mdW5jdGlvbiBydW5PQ1JhbmRTaG93KCkge1xuXG5cdGJlemllckRyYXdlci5lcmFzZShjYW52YXMsIGN0eCk7XG5cdGJlemllckRyYXdlci5sb29wKGNhbnZhcywgY3R4KTtcblx0YmV6aWVyRHJhd2VyLmxvb3AoY2FudmFzLCBjdHgpO1xuXG5cdGlmICggcGxlYXNlcnVuICkge1xuXHRcdHJ1bk9DUigpO1xuXHR9XG59XG5cblxub25sb2FkID0gaW5pdDtcblxuXG52YXIgYmV6aWVyRHJhd2VyID0ge1xuXHRpbml0IDogZnVuY3Rpb24gKGNhbnZhcywgYykge1xuXG5cdFx0Yy5jYW52YXMud2lkdGggID0gODk7XG5cdFx0Yy5jYW52YXMuaGVpZ2h0ID0gMTE4O1xuXG5cdFx0Yy5maWxsU3R5bGUgPSAnd2hpdGUnO1xuXHRcdGMuZmlsbFJlY3QoMCwwLGNhbnZhcy53aWR0aCxjYW52YXMuaGVpZ2h0KTtcblx0XHQvL2NvbnNvbGUubG9nKGNhbnZhcy53aWR0aCk7XG5cdFx0Yy5maWxsU3R5bGUgPSAncmdiKDI1NSwyNTUsMjU1KSdcblx0XHR4MSA9IGNhbnZhcy53aWR0aCAqIE1hdGgucmFuZG9tKCk7XG5cdFx0eTEgPSBjYW52YXMuaGVpZ2h0ICogTWF0aC5yYW5kb20oKTtcblx0XHR4MiA9IGNhbnZhcy53aWR0aCAqIE1hdGgucmFuZG9tKCk7XG5cdFx0eTIgPSBjYW52YXMuaGVpZ2h0ICogTWF0aC5yYW5kb20oKTtcblx0XHR4MyA9IGNhbnZhcy53aWR0aCAqIE1hdGgucmFuZG9tKCk7XG5cdFx0eTMgPSBjYW52YXMuaGVpZ2h0ICogTWF0aC5yYW5kb20oKTtcblx0XHR4NCA9IGNhbnZhcy53aWR0aCAqIE1hdGgucmFuZG9tKCk7XG5cdFx0eTQgPSBjYW52YXMuaGVpZ2h0ICogTWF0aC5yYW5kb20oKTtcblxuXHRcdGRlY2FsYWdlWCA9IC0zO1xuXHRcdGRlY2FsYWdlWSA9ICszO1xuXG5cdH0sXG5cblx0bG9vcCA6IGZ1bmN0aW9uIChjYW52YXMsIGMpIHtcblx0XHRjLmJlZ2luUGF0aCgpO1xuXHRcdGMubGluZVdpZHRoID0gNDtcblxuLypcblx0XHR4MSA9IHg0O1xuXHRcdHkxID0geTQ7XG5cdFx0eDIgPSBjYW52YXMud2lkdGggKiBNYXRoLnJhbmRvbSgpO1xuXHRcdHkyID0gY2FudmFzLmhlaWdodCAqIE1hdGgucmFuZG9tKCk7XG5cdFx0eDMgPSBjYW52YXMud2lkdGggKiBNYXRoLnJhbmRvbSgpO1xuXHRcdHkzID0gY2FudmFzLmhlaWdodCAqIE1hdGgucmFuZG9tKCk7XG5cdFx0eDQgPSBjYW52YXMud2lkdGggKiBNYXRoLnJhbmRvbSgpO1xuXHRcdHk0ID0gY2FudmFzLmhlaWdodCAqIE1hdGgucmFuZG9tKCk7XG4qL1xuXG5cdFx0eDEgPSBiZXppZXJEcmF3ZXIudXBkYXRlVyh4MSk7XG5cdFx0eTEgPSBiZXppZXJEcmF3ZXIudXBkYXRlSCh5MSk7XG5cdFx0eDIgPSBiZXppZXJEcmF3ZXIudXBkYXRlVyh4Mik7XG5cdFx0eTIgPSBiZXppZXJEcmF3ZXIudXBkYXRlSCh5Mik7XG5cdFx0eDMgPSBiZXppZXJEcmF3ZXIudXBkYXRlVyh4Myk7XG5cdFx0eTMgPSBiZXppZXJEcmF3ZXIudXBkYXRlSCh5Myk7XG5cdFx0eDQgPSBiZXppZXJEcmF3ZXIudXBkYXRlVyh4NCk7XG5cdFx0eTQgPSBiZXppZXJEcmF3ZXIudXBkYXRlSCh5NCk7XG5cblx0XHRjLm1vdmVUbyh4MSwgeTEpO1xuXHRcdGMuYmV6aWVyQ3VydmVUbyggeDIsIHkyLCB4MywgeTMsIHg0LCB5NCk7XG5cblx0XHRjLnN0cm9rZVN0eWxlID0gXCJyZ2IoMCwwLDApXCI7XG5cdFx0Yy5zdHJva2UoKTtcblxuXHR9LFxuXG5cdGVyYXNlIDogZnVuY3Rpb24gKGNhbnZhcywgYykge1xuXHRcdGMuZmlsbFN0eWxlID0gJ3JnYigyNTUsMjU1LDI1NSknO1xuXHRcdGMuZmlsbFJlY3QoMCwwLGNhbnZhcy53aWR0aCxjYW52YXMuaGVpZ2h0KTtcblxuXHR9LFxuXG5cdHVwZGF0ZVcgOiBmdW5jdGlvbiAodmFsdWUpIHtcblx0XHRyZXR1cm4gKGNhbnZhcy53aWR0aCAqIE1hdGgucmFuZG9tKCkpO1xuXHR9LFxuXG5cdHVwZGF0ZUggOiBmdW5jdGlvbiAodmFsdWUpIHtcblx0XHRyZXR1cm4gKGNhbnZhcy5oZWlnaHQgKiBNYXRoLnJhbmRvbSgpKTtcblx0fSxcbn07Il19
