var isMobile = false;
var onPointerDownPointerX = 0;
var onPointerDownPointerY = 0;
var mousePosX = -1;
var mousePosY = -1;
var isUserInteracting = false;

var a = location.href;
var b = a.substring(a.indexOf("?")+1);
wd.project = b.replace("%20", " ");
var script;
if (a.indexOf("?") > 0) {
	script = document.createElement('script');
	script.type= 'text/javascript';
	script.src='src/Version_Project/'+wd.project+'/Options.js';
	var head = document.getElementsByTagName('head')[0];
	head.appendChild(script);
}

window.onload = function() {
	var SplitterHandle = document.getElementById("SplitterHandle");
	SplitterHandle.addEventListener( 'mousedown', SplitterMouseDown, false );
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	document.addEventListener( 'mouseup', onDocumentMouseUp, false );
	
	SplitterHandle.addEventListener('mouseenter', onSplitterHandleMouseOver, false);
	SplitterHandle.addEventListener('mouseout', onSplitterHandleMouseLeave, false);
	
	if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)) {
		MobileOn();
	} else {
		$("#TopMessage").show();
	}
	
	if (isMobile) {
		SplitterHandle.addEventListener( 'touchstart', SplitterMouseDown, false );
		document.addEventListener( 'touchmove', onDocumentMouseMove, false );
		document.addEventListener( 'touchend', onDocumentMouseUp, false );
	}
	
	var sel = document.getElementById("NameA");
	for (var i=0; i<wd.options.length; i++){
		var op = document.createElement("option");
		op.innerText = wd.options[i];
		op.value = i;
		sel.appendChild(op);
	}
	sel = document.getElementById("NameB");
	for (var i=0; i<wd.options.length; i++){
		var op = document.createElement("option");
		op.innerText = wd.options[i];
		op.value = i;
		sel.appendChild(op);
	}
	//SetImageA(0);
	//SetImageB(0);
	
	mousePosX = window.innerWidth/2;
	EditTransSlider();
	Resize();
}


window.onresize = function() {
	Resize();
}

function MobileOn() {
	isMobile = true;
}

var OffsetX = 0;
var OffsetY = 0;
function SplitterMouseDown( event ) {
	event.preventDefault();
	
	isUserInteracting = true;
	isUserDragging = false;
	
	if (event.targetTouches != undefined && event.targetTouches.length > 0) {
		onPointerDownPointerX = event.targetTouches[0].clientX;
		onPointerDownPointerY = event.targetTouches[0].clientY;
	} else {
		onPointerDownPointerX = event.clientX;
		onPointerDownPointerY = event.clientY;
	}
	OffsetX = (onPointerDownPointerX-document.getElementById("ToggleContainer").offsetLeft) - document.getElementById("SplitterHandle").offsetLeft;
	OffsetY = (onPointerDownPointerY-document.getElementById("ToggleContainer").offsetTop) - document.getElementById("SplitterHandle").offsetTop;
	
	//var NameB = document.getElementById("NameB");
	//var NameA = document.getElementById("NameA");
	//NameB.style.opacity = NameA.style.opacity = 1;
	
	if (toolIntv == undefined){
		clearInterval(toolIntv);
		toolIntv = undefined;
	}
	$("#SplitterHandle_Tooltip").stop().fadeOut(800);
}


function onDocumentMouseMove( event ) {
	if (event.targetTouches != undefined && event.targetTouches.length > 0) {
		mousePosX = event.targetTouches[0].clientX;
		mousePosY = event.targetTouches[0].clientY;
	}
	else {
		mousePosX = event.clientX;
		mousePosY = event.clientY;
	}
	
	var SplitterHandle = document.getElementById("SplitterHandle");
	var SplitterHandle_Tooltip = document.getElementById("SplitterHandle_Tooltip");
	SplitterHandle_Tooltip.style.left = mousePosX - 280 + "px";
	SplitterHandle_Tooltip.style.top = mousePosY - 90 + "px";
	
	var PointerArrow = document.getElementById("PointerArrow");
	PointerArrow.style.left = SplitterHandle.offsetWidth + SplitterHandle.offsetLeft + 10 + "px";
	PointerArrow.style.top = SplitterHandle.offsetTop - PointerArrow.offsetHeight - 10 + "px";
	
	if ( isUserInteracting === true ) {
		EditTransSlider();
	}
}

var toolIntv;
function onSplitterHandleMouseOver() {
	if ( isUserInteracting != true ) {
		$("#SplitterHandle_Tooltip")
			.stop()
			.fadeIn();
		
		if (toolIntv == undefined){
			toolIntv = setTimeout( function() {
				$("#SplitterHandle_Tooltip").stop().fadeOut(800);
				toolIntv = undefined;
			}, 2000 );
		}
		
	}
}
function onSplitterHandleMouseLeave() {
	if ( isUserInteracting != true ) {
		$("#SplitterHandle_Tooltip")
			.stop()
			.hide();
	}
	if (toolIntv == undefined){
		clearInterval(toolIntv);
		toolIntv = undefined;
	}
}


function Resize() {
	var ToggleContainer = document.getElementById("ToggleContainer");
	var DivImageA = document.getElementById("DivImageA");
	var DivImageB2 = document.getElementById("DivImageB2");
	
	//ToggleContainer.style.width = window.innerWidth + "px";
	
	
	var bgHeight = document.body.offsetWidth * imgA.height / imgA.width;
	if (!isNaN(bgHeight)) ToggleContainer.style.height = bgHeight + "px";
	if (bgHeight >= window.innerHeight) ToggleContainer.style.height = "99%";
	
	DivImageA.style.width = ToggleContainer.offsetWidth + "px";
	DivImageA.style.height = ToggleContainer.offsetHeight + "px";
	DivImageB2.style.width = ToggleContainer.offsetWidth + "px";
	DivImageB2.style.height = ToggleContainer.offsetHeight + "px";
	
	
	mousePosX = window.innerWidth/2;
	mousePosY = 0;
	EditTransSlider();
}

function EditTransSlider() {
	var SplitterHandle = document.getElementById("SplitterHandle");
	var Splitter = document.getElementById("Splitter");
	var ToggleContainer = document.getElementById("ToggleContainer");
	var DivImageA = document.getElementById("DivImageA");
	var DivImageA_Text = document.getElementById("DivImageA_Text");
	var DivImageB_Text = document.getElementById("DivImageB_Text");
	
	var percent = (((mousePosX-OffsetX)-ToggleContainer.offsetLeft)/ToggleContainer.offsetWidth);
	if (percent < 0) percent = 0;
	if (percent > 1) percent = 1;
	Splitter.style.left = SplitterHandle.style.left = percent*100 + "%";
	DivImageB.style.left = percent*100 + "%";
	DivImageB.style.width = (1-percent)*100 + "%";
	
	var mp = (mousePosY-OffsetY);
	// find the top of the ramp
	mp = mp-(ToggleContainer.offsetTop + (ToggleContainer.offsetHeight*0.3));
	percent = mp / (ToggleContainer.offsetHeight/3);
	if (percent < 0) percent = 0;
	if (percent > 1) percent = 1;
	DivImageB.style.opacity = DivImageB_Text.style.opacity = 1-percent;
	//NameB.style.opacity = 1-(percent*0.6);
	//NameA.style.opacity = (percent*0.6)+0.4;
	SplitterHandle.style.top = (0.3+(percent/3)) * 100 + "%";
	//SplitterHandle.innerText = Math.round((DivImageB.style.opacity*100))+"%";
	
	DivImageB_Text.style.left = Splitter.offsetLeft + 10 + "px";
	DivImageA_Text.style.right = window.innerWidth - DivImageB_Text.offsetLeft + 10 + "px";
	
	//Resize();
	console.log(percent);
	if (percent == 1){
		$("#IsTransparentReminder").stop().fadeIn();
	} else {
		$("#IsTransparentReminder").stop().fadeOut();
	}
}


function onDocumentMouseUp( event ) {
	if (event != undefined){
		event.stopPropagation();
		event.preventDefault();
	}
	isUserInteracting = false;
	SplitMove = false;
	OpacityMove = false;
}

var helpshown = false;
function NewImageA() {
	var sel = document.getElementById("NameA");
	if (sel.value == "") return;
	$(".Help").fadeOut();
	if(document.getElementById("DivImageB2").style.backgroundImage == "") $("#Help_Step3").fadeIn();
	else if (!helpshown) { $("#Help_Step4").fadeIn(); helpshown = true; }
	$("#DivImageA_Text, #DivImageB_Text, #SplitterHandle, #Splitter").show();
	SetImageA(sel.value);
}
function NewImageB() {
	var sel = document.getElementById("NameB");
	if (sel.value == "") return;
	$(".Help").fadeOut();
	if(document.getElementById("DivImageA").style.backgroundImage == "") $("#Help_Step2").fadeIn();
	else if (!helpshown) { $("#Help_Step4").fadeIn(); helpshown = true; }
	$("#DivImageA_Text, #DivImageB_Text, #SplitterHandle, #Splitter").show();
	SetImageB(sel.value);
}

var imgA = new Image();
function SetImageA(ind) {
	//var imgA = document.getElementById("imgA");
	imgA.src = "src/Version_Project/"+wd.project+"/"+wd.options[ind];
	document.getElementById("DivImageA").style.backgroundImage = "url('src/Version_Project/"+wd.project.replace(" ", "%20")+"/"+wd.options[ind].replace(" ", "%20");
	//imgA.src = document.getElementById("DivImageA").style.backgroundImage;
	//window.getComputedStyle(document.body)
	Resize();
}
function SetImageB(ind) {
	//var imgB = document.getElementById("imgB");
	//imgB.src = "src/Version_Project/"+wd.project+"/"+wd.options[ind];
	document.getElementById("DivImageB2").style.backgroundImage = "url('src/Version_Project/"+wd.project.replace(" ", "%20")+"/"+wd.options[ind].replace(" ", "%20");
	Resize();
}
function CloseHelp_Step4() {
	$("#Help_Step4").fadeOut();
	$("#PointerArrow").fadeIn().fadeOut().fadeIn().fadeOut().fadeIn().fadeOut().fadeIn().fadeOut();
}