//THREE.SceneUtils.traverseHierarchy( object, function ( object ) { object.visible = false; } );


// test for sceen size to reduce images
// also remove menus
// test for touch capable



// wd.CamPos[0][1][0]
// line index
// 0 - camera name, 1 - position array
// 0 - x, 1 - y, 2 - z

var chosenPOV = 0; // index of the current camera
// loop through on first run to get the index
// just in case the image loaded is not the first in the list

// From the chosen camera
// make the other points at an offset
// camera will always be at 0,0,0
// no longer using projector
var camera, scene, renderer, raycaster, ImageDome, controls, effect;
//var plight, dirLight;
var mouse = new THREE.Vector2();
var ScreenCenter = new THREE.Vector2();
var INTERSECTED;
var INFO_OBJECT, Selected_INFO_OBJECT;
var camangles, camangles_objs; // the sprites and the selection geometry
var infoBoxes;
var POVsHidden = false;
var ZoomValue = 0;

var isStereo = false;
var isMobile = false;
var isAccel = false;

var lowRes = ""; // used to source the images in the low folder

var isUserInteracting = false, isUserDragging = false,
onMouseDownMouseX = 0, onMouseDownMouseY = 0,
lon = 0, onMouseDownLon = 0,
lat = 0, onMouseDownLat = 0,
phi = 0, theta = 0;

var mousePosX = -1;
var mousePosY = -1;

var images = new Array();
var DomeTextures = {};

var a = location.href;
var b = a.substring(a.indexOf("?")+1);
wd.project = b.replace("%20", " ");

function DrawCross() { // for testing purposes
	$("#cross").show();
	// Used to visually find the perfect center of the screen
	// draws to lines like an X so you can see the center
	var c=document.getElementById("cross");
	c.width = window.innerWidth/2;
	c.height = window.innerHeight;
	var ctx=c.getContext("2d");
	ctx.beginPath();
	ctx.moveTo(0,0);
	ctx.lineTo($(c).width(),$(c).height());
	ctx.stroke();
	
	ctx.beginPath();
	ctx.moveTo($(c).width(),0);
	ctx.lineTo(0,$(c).height());
	ctx.stroke();
}

window.onload = function() {
	//TEST
	//DrawCross();
	//$("#CenterDiv").show();
	//$("#DoublePointCirlceLeft, #DoublePointCirlceRight").show();
	
	if (a.indexOf("?")<=0) {return;}
	document.getElementById("TitleBarText").innerText = decodeURIComponent(wd.project);
	
	//$("#ObjectInfo").hide();
	//$("#ObjectInfo").show();
	
	if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)) {
		MobileOn();
	} else {
		$("#TopMessage").show();
	}
	
	// center of the screen for Look At Selection
	ScreenCenter.x = 0; 
	ScreenCenter.y = 0;
	
	init();
	EndLoading();
	//createCameraList();

	//PreloadTextures();
	//preloadImages();
}

// -------- FUTURE ADDITIONS

// Grab elements, create settings, etc.
/*
var video = document.getElementById('video');

// Get access to the camera!
if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    // Not adding `{ audio: true }` since we only want video now
    navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
        video.src = window.URL.createObjectURL(stream);
        video.play();
    });
}
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
		document.getElementById("GPS").innerHTML = "Geolocation is not supported by this browser.";
    }
	console.log(navigator.geolocation);
}
function showPosition(position) {
    var g = "Latitude: " + position.coords.latitude + "<br>Longitude: " + position.coords.longitude;
	document.getElementById("GPS").innerHTML = "GPS coords: " + g;
}
*/
// -------- FUTURE ADDITIONS


function EndLoading(){
	var maxanisotropy = renderer.getMaxAnisotropy();
	for (var nm in DomeTextures) {
		DomeTextures[nm].anisotropy = maxanisotropy;
	}
	
	// Add the map image
	//$("#LoadingWord")[0].innerText = "Complete";
	//wd.CamPos.push( {name:"Map", x:0, y: 200, z: 0, rx:0.0000, ry: 0.0000, rz: 0.0000, lookx:0, looky: 0, lookz: 0, lookry: 0.0000 } );
	//wd.CamPos.push( {name:"Map", x:0, y: 200, z: 0 } );
	
	//wd.CamPos[wd.CamPos.length-1].button = undefined;

	//ChangePOV(wd.CamPos[0].name);
	
	container.addEventListener( 'mousedown', onDocumentMouseDown, false );
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	document.addEventListener( 'mouseup', onDocumentMouseUp, false );
	container.addEventListener( 'mousewheel', onDocumentMouseWheel, false );
	container.addEventListener( 'DOMMouseScroll', onDocumentMouseWheel, false);
	
	if (isMobile) {
		container.addEventListener( 'touchstart', onDocumentMouseDown, false );
		document.addEventListener( 'touchmove', onDocumentMouseMove, false );
		container.addEventListener( 'touchend', onDocumentMouseUp, false );
		
		//$("#ZoomText")[0].addEventListener( 'touchstart', RefreshZoom, false);
		//$("#MapButton")[0].addEventListener( 'touchstart', MapView, false);
		//$("#HideShowImageButton")[0].addEventListener( 'touchstart', HideShowImage, false);
		//$("#HideShowPOVButton")[0].addEventListener( 'touchstart', HideShowPOVs, false);
		//$("#CameraListButton")[0].addEventListener( 'touchstart', HideShowCameras, false);
		
		//$("#StereoIcon")[0].addEventListener( 'touchstart', StereoOn, false);
		//$("#AccelIcon")[0].addEventListener( 'touchstart', AccelOn, false);
	}
	
	$("#TopMessage").insertBefore("#ButtonBar");
	$("#SettingButtons").insertAfter("#TitleBarLogo");
	
	animate();
}

var touched;
function BlockDoubleTap() {
	if (touched != undefined) return true;
	touched = setTimeout(function() { touched = undefined; }, 100);
	return false;
}

function MobileOn() {
	isMobile = true;
	lowRes = "lowRes/";
	
	$("#TitleBar").css({
		"height" : "34px",
	});
	$("#TitleBarText").css({
		"font-size" : "1.4em",
		"padding" : "0px 70px",
		"bottom" : "17px"
	});
	$("#TitleBarLogo").css({
		"width" : "50px",
		"padding" : "0px 10px"
	});
	$("#ObjectInfoText").css({
		"padding" : "0.2em"
	});
}

function StereoOn() {
	//if (BlockDoubleTap()) return;
	isStereo = !isStereo;
	$("#CenterPoint, #DoublePointLeft, #DoublePointRight, #DoublePointCirlceLeft, #DoublePointCirlceRight").toggle();
	if (effect == undefined) {
		effect = new THREE.StereoEffect( renderer );
		effect.setSize( window.innerWidth, window.innerHeight );
	}
	
	isAccel = isStereo;
	if (controls == undefined) {
		controls = new THREE.DeviceOrientationControls( camera );
		controls.connect();
	}
	
	if (isAccel){ $("#CenterDiv").show(); } else { $("#CenterDiv").hide(); }
	
	onWindowResize();
}
function AccelOn() {
	//if (BlockDoubleTap()) return;
	$("#CenterDiv").toggle();
	isAccel = !isAccel;
	if (controls == undefined) {
		controls = new THREE.DeviceOrientationControls( camera );
		controls.connect();
	}
}


function init() {
	var container = document.getElementById( 'container' );
	camera = new THREE.PerspectiveCamera( 65, window.innerWidth / window.innerHeight, 1, 100000 );
	camera.target = new THREE.Vector3(0,0,0);
	camera.position.set(0,54,0);
	scene = new THREE.Scene();
	raycaster = new THREE.Raycaster();
	//
	var geometry = new THREE.SphereGeometry( 50010, 60, 40 ); // radius, division height, division width
	geometry.scale( - 1, 1, 1 );
	
	
	var video = document.createElement( 'video' );
	video.width = 4096;
	video.height = 2054;
	video.loop = true;
	video.muted = false;
	video.src = "src/video/"+wd.project+".mp4";//"textures/pano.webm";
	video.setAttribute( 'webkit-playsinline', 'webkit-playsinline' );
	video.play();
	var texture = new THREE.VideoTexture( video );
	texture.minFilter = THREE.LinearFilter;
	texture.magFilter = THREE.LinearFilter;
	texture.format = THREE.RGBFormat;
	var material   = new THREE.MeshBasicMaterial( { map : texture, side: THREE.FrontSide } );
	
	//var DomeMaterial = new THREE.MeshBasicMaterial({
	//	side: THREE.BackSide,
	//	transparent: true,
	//	opacity: 1,
	//});
	ImageDome = new THREE.Mesh( geometry, material);//DomeMaterial );
	ImageDome.rotation.set(0,3.3,0);
	scene.add(ImageDome);
	
	// ###############
	
	//dirLight = new THREE.DirectionalLight(0xf1faff, 1);
	//scene.add(dirLight);
	//
	//plight = new THREE.PointLight( 0x7fffd4, 5, 0 ); // 0 means distance is endless
	//scene.add(plight)
	
	// ############
	
	renderer = new THREE.WebGLRenderer({antialias: false });
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	container.appendChild( renderer.domElement );
	renderer.sortObjects = false; // controls depth sorting, but I'm still not sure how this works
	
	window.addEventListener( 'resize', onWindowResize, false );

	
	var pos = new THREE.Vector3(60, 98, -500);
	var sprite = DrawSparkSprite(pos);
	//sprite.name = wd.CamPos[i].name;
	sprite.material.opacity = 1;
	scene.add( sprite );
	
	var pos = new THREE.Vector3(186, 0, -60);
	var sprite = DrawSparkSprite(pos);
	//sprite.name = wd.CamPos[i].name;
	sprite.material.opacity = 1;
	scene.add( sprite );
	
	//var sp = DrawSprite ("Hello", 10000, new THREE.Vector3(0, 0, 0), "rgb(0, 55, 255)", "rgb(0,0,0)");
	//console.log(sp);
	//scene.add(sp);
	
	//DrawOtherPOVs();
	//DrawInfoBoxes();
	
}

function RefreshZoom(event) {
	//if (BlockDoubleTap()) return;
	if (event != undefined)
	{
		event.stopPropagation();
		event.preventDefault();
	}
	
	camera.fov = 65;
	ZoomValue = 0;
	$("#ZoomText")[0].innerText = "Zoom: 0";
	camera.updateProjectionMatrix();
}

function CloseObjectInfo() {
	Selected_INFO_OBJECT = undefined;
	document.getElementById("ObjectInfoText").innerHTML = "Object Info:";
	$("#ObjectInfo").hide();
	CameraListSize();
}

function allButtonsOff() {
	
}

function createCameraList() {
	var camlist = document.getElementById("CameraList2");
	var i = 0;
	camangles.children.forEach( function(child) {
		var nb = document.createElement("button");
		wd.CamPos[i].button = nb; i++;
		nb.innerText = child.name;
		nb.className = "camListButtons";
		nb.onclick = nb.ontouchstart = function(){
			console.log("BUTTON");
			ChangePOV(this.innerText);
			return false;
		};
		camlist.appendChild(nb);
	});
	CameraListSize();
}

function CameraListSize() {
	var CameraList = document.getElementById("CameraList");
	var CameraListButton = document.getElementById("CameraListButton");
	var SettingButtons = document.getElementById("SettingButtons");
	
	var bottomOffset = SettingButtons.offsetTop;
	if (bottomOffset < 10)
	{
		bottomOffset = window.innerHeight;
	}
	var top = CameraListButton.offsetTop + CameraListButton.offsetHeight + 8;
	CameraList.style.top = top + "px";
	CameraList.style.height = (bottomOffset - 45) - top + "px";
}

function InchesToFeeet( inches ) {
	var feet = Math.floor(inches / 12);
	inches %= 12;
	inches = Math.round(inches*10) / 10
	return feet + "'-" + inches + '"';
}

function WordTexture(words, color, bg) {
   var canvas1 = document.createElement('canvas');
   var context1 = canvas1.getContext('2d');
   context1.font = "Bold 400px Arial";
   var wd = context1.measureText(words).width;
   var ht = 400;
   canvas1.width = wd;
   canvas1.height = ht;
   
   context1.fillStyle = bg;
   context1.fillRect(0,0,wd,ht);
   
   context1.font = "Bold 400px Arial";
   context1.fillStyle = color;
   context1.textAlign = "left";
   //context1.fillText(words, canvas1.width / 2, (canvas1.height / 2)+ (ht / 3) );
   context1.fillText(words, 0, (canvas1.height / 2)+ (ht / 3) );
   
   // canvas contents will be used for a texture
   var texture1 = new THREE.Texture(canvas1);
   //texture1.minFilter = texture1.magFilter = THREE.LinearFilter;
   texture1.needsUpdate = true;
   return [texture1, wd, ht];
}

function DrawSprite (words, sz, pos, color, bg) {
   var textureresults = WordTexture(words, color, bg);
   var texture1 = textureresults[0];
   var wd = textureresults[1];
   var ht = textureresults[2];

   //var map = THREE.ImageUtils.loadTexture( "sprite.png" );
   var material = new THREE.SpriteMaterial({ map: texture1, });
   var object = new THREE.Sprite(material);
   var width = material.map.image.width;
   var height = material.map.image.height;
   object.scale.set(sz, sz / width * height, 1);
   object.position.set(pos[0], pos[1], pos[2]);
   return object;
   //scene.add(object);
}

function DrawSparkSprite(pos) {
	var src = 'src/img/SparkIcon.png';
	var spriteMap = new THREE.TextureLoader().load( src );
	var spriteMaterial = new THREE.SpriteMaterial( { map: spriteMap } );
		//color: 0xffffff	} );
	var sprite = new THREE.Sprite( spriteMaterial );
	var width = 256;
	var height = 512;
	var sc = 0.08;
	sprite.scale.set(width*sc, height*sc, 1);
	sprite.position.set(pos.x,pos.y+((height*sc)/2),pos.z);
	//scene.add(sprite);
	return sprite;
}

//var imageLoadSuccess = true;
function preloadImages(){
	_3DLogo = new Image();
	_3DLogo.src = "src/img/3DLogo.png";
	TitleBar = new Image();
	TitleBar.src = "src/img/TitleBar.png";
}


function PreloadTextures() {
	preloadImages();
	for (var i=0; i < wd.CamPos.length; i++){
		var src = '../../uploads/360Projects/' + wd.project + '/' + lowRes + wd.CamPos[i].name + '.jpg';
		var texloader = new THREE.TextureLoader();
		var nm = wd.CamPos[i].name;
		DomeTextures[nm] = texloader.load(src, function(tex, nm) {
			ImageIsLoaded();
			tex.name = nm;
			tex.minFilter = THREE.LinearFilter;
			tex.generateMipmaps = false;
		});
	}
}


var ImagesLoaded = 0;
function ImageIsLoaded() {
	ImagesLoaded += 1;
	if (ImagesLoaded >= wd.CamPos.length) {
		EndLoading();
		$("#Loading").fadeTo( "slow" , 0, function() {
			$("#Loading").hide();
		});
	}
	$("#LoadingWord")[0].innerText = (ImagesLoaded + " / " + (wd.CamPos.length));
}

function DrawOtherPOVs(){
	camangles = new THREE.Object3D();
	camangles_objs = new THREE.Object3D();
	
	for (var i=0; i < wd.CamPos.length; i++){
		var pos = new THREE.Vector3(wd.CamPos[i].x, wd.CamPos[i].y, wd.CamPos[i].z);
		//var rot = new THREE.Vector3(wd.CamPos[i].rx, wd.CamPos[i].ry, wd.CamPos[i].rz);
		
		var sprite = DrawSparkSprite(pos);
		sprite.name = wd.CamPos[i].name;
		sprite.material.opacity = 0.58;
		camangles.add( sprite );
		
		/*while (rot.y > 360){ rot.y -= 360; }
		while (rot.y < 0){ rot.y += 360; }
		rot.x = THREE.Math.degToRad(rot.x-90);
		rot.y = THREE.Math.degToRad(rot.y);
		rot.z = THREE.Math.degToRad(rot.z);*/
		
		var material = new THREE.MeshLambertMaterial({
			color: "rgb(0, 0, 0)",
			emissive: "rgb(255,0,0)",
			//side: THREE.SingleSide,
			transparent: true,
			opacity: 0.58,
			visible: false, // hides the object but it is still raycast-able
		});
		
		var ht = 29;
		var geometry = new THREE.ConeGeometry( 11, ht, 32 );
		//var geometry = new THREE.BoxGeometry( 22, ht, 22 );
		//var geometry = new THREE.SphereGeometry( 2.8, 40, 30 );
		mesh = new THREE.Mesh( geometry, material );
		mesh.name = wd.CamPos[i].name;
		mesh.position.set(pos.x, ht/2-5, pos.z);
		//mesh.scale.y = 3.2;
		mesh.rotation.set(0,0,3.1415);
		mesh.spriteObj = sprite;
		camangles_objs.add( mesh );
		
		var geometry = new THREE.SphereGeometry( 10, 20, 20 );
		mesh = new THREE.Mesh( geometry, material );
		mesh.name = wd.CamPos[i].name;
		mesh.position.set(pos.x, ht+3, pos.z);
		mesh.spriteObj = sprite;
		camangles_objs.add( mesh );
		
	}
	scene.add(camangles);
	scene.add(camangles_objs);
	
	//
}

function DrawInfoBoxes(){
	infoBoxes = new THREE.Object3D();
	
	for (var i=0; i < wd.InfoBoxPos.length; i++){
		
		var material = new THREE.MeshBasicMaterial({
			color: "white",
			//side: THREE.SingleSide,
			transparent: true,
			opacity: 0.000001,
			visible: true
		} );
		
		var pos = new THREE.Vector3(wd.InfoBoxPos[i].x, wd.InfoBoxPos[i].y, wd.InfoBoxPos[i].z);
		var rot = new THREE.Vector3(wd.InfoBoxPos[i].rx, wd.InfoBoxPos[i].ry, wd.InfoBoxPos[i].rz);
		var piv = new THREE.Vector3(wd.InfoBoxPos[i].pivx, wd.InfoBoxPos[i].pivy, wd.InfoBoxPos[i].pivz);
		
		var mesh = new THREE.BoxGeometry(wd.InfoBoxPos[i].wx,wd.InfoBoxPos[i].hy,wd.InfoBoxPos[i].dz);
		var cube = new THREE.Mesh(mesh, material);
		var wire = new THREE.BoxHelper( cube, new THREE.Color("rgb(20, 160, 230)") );
		wire.material.transparent = true;
		wire.material.opacity = 0.8;
		//wire.material.linewidth = 5; // doesn't do anything
		//wire.material.overdraw = 5; // doesn't do anything
		//wire.renderOrder = 1;
		//wire.material.needsUpdate = true;
		wire.visible = false;
		cube.add(wire);
		cube.name = wd.InfoBoxPos[i].name;
		//cube.position.set(pos.x, pos.y, pos.z);
		//while (rot.y > 360){ rot.y -= 360; }
		//while (rot.y < 0){ rot.y += 360; }
		rot.x = THREE.Math.degToRad(rot.x);
		rot.y = THREE.Math.degToRad(rot.y);
		rot.z = THREE.Math.degToRad(rot.z);
		// move the pivot
		mesh.applyMatrix( new THREE.Matrix4().makeTranslation(pos.x-piv.x, pos.y-piv.y, pos.z-piv.z) );
		wire.applyMatrix( new THREE.Matrix4().makeTranslation(pos.x-piv.x, pos.y-piv.y, pos.z-piv.z) );
		cube.position.set(piv.x, piv.y, piv.z);
		cube.rotation.set(rot.x, rot.y, rot.z);
		cube.info = {
			name: wd.InfoBoxPos[i].name,
			note:"",
			width:InchesToFeeet(wd.InfoBoxPos[i].wx),
			height:InchesToFeeet(wd.InfoBoxPos[i].hy),
			elevation:InchesToFeeet(pos.y-(wd.InfoBoxPos[i].hy/2))
			};
		
		infoBoxes.add(cube);
	}
	scene.add(infoBoxes);
}

function HideShowImage(event) {
	//if (BlockDoubleTap()) return;
	if (event != undefined)
	{
		event.stopPropagation();
		event.preventDefault();
	}
	
	if (ImageDome.material.opacity < 1) {
		ImageDome.material.opacity = 1;
	} else {
		ImageDome.material.opacity = 0.46;
	}
}

function HideShowPOVs(event) {
	//if (BlockDoubleTap()) return;
	if (event != undefined)
	{
		event.stopPropagation();
		event.preventDefault();
	}
	if (camangles == undefined || camangles_objs == undefined) return;
	camangles.children.forEach( function(child) {
		child.visible = POVsHidden;
	});
	camangles.children[chosenPOV].visible = false;
	camangles_objs.children.forEach( function(child) {
		child.visible = POVsHidden;
		if (child.name == wd.CamPos[chosenPOV].name) child.visible = false;
	});
	
	POVsHidden = !POVsHidden;
	//if (POVsHidden) { document.getElementById("HideShowPOVButton").innerText = "Show POV Locations"; }
	//else { document.getElementById("HideShowPOVButton").innerText = "Hide POV Locations"; }
}

function HideShowCameras(event) {
	//if (BlockDoubleTap()) return;
	//if (isMobile){
	//	$("#CameraList").toggle();
	//}
	//else {
		CameraListSize();
		$("#CameraList").stop().slideToggle();
	//}
}

function ChangePOV(camName){
	EnableSelectionTimer = undefined;
	noSelect = true;
	
	//scene.remove(scene.children); // i dont know why i have this
	$(".camListButtonsOn").attr('class', 'camListButtons');
	
	for (var i=0; i < wd.CamPos.length; i++){
		chosenPOV = i;
		if (camName == wd.CamPos[i].name) break;
	}
	wd.CamPos[chosenPOV].button.className = "camListButtonsOn";
	PositionRig();
	
	GetAllPOVAngles();
	
	if (camangles == undefined || camangles_objs == undefined) return;
	camangles.children.forEach( function(child) {
		child.visible = true;
	});
	camangles.children[chosenPOV].visible = false;
	camangles_objs.children.forEach( function(child) {
		child.visible = true;
		if (child.name == camName) child.visible = false;
	});
}

function PositionRig() {
	var pos = new THREE.Vector3(
		wd.CamPos[chosenPOV].x,
		wd.CamPos[chosenPOV].y,
		wd.CamPos[chosenPOV].z
		);
	/*var look = new THREE.Vector3(
		wd.CamPos[chosenPOV].lookx,
		wd.CamPos[chosenPOV].looky,
		wd.CamPos[chosenPOV].lookz
		);*/
	
	camera.position.set( pos.x, pos.y, pos.z );

	ImageDome.position.set( pos.x, pos.y, pos.z );
	// Rotates the sphere to be at the correct world orientation
	if (wd.flip != undefined) {
		console.log("Flipped");
		ImageDome.rotation.y = THREE.Math.degToRad( -180 );
	} else {
		if (wd.CamPos[chosenPOV].ry == undefined){
			ImageDome.rotation.y = THREE.Math.degToRad( 90 );
			console.log("No Rotation");
		} else {
			ImageDome.rotation.y = THREE.Math.degToRad( wd.CamPos[chosenPOV].ry+90 );
		}
	}
	
	var domeImage = wd.CamPos[chosenPOV].name;
	ImageDome.material.map = DomeTextures[domeImage];
	ImageDome.material.needsUpdate = true;
}

function MapView() {
	return;
	//if (BlockDoubleTap()) return;
	ChangePOV("Map");
	ImageDome.visible = false;
	WriteAllData(camera);
}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

	if (effect != undefined) effect.setSize( window.innerWidth, window.innerHeight );
}

function FadeMenus(val) {
	var speed = "fast";
	if (val > 0.5) { speed = 1000; } // the low is not 0, but 0.2 about
	var g = ["CameraList", "TopMessage", "ObjectInfo", "ButtonBar", "TitleBar", "TitleBarText", "TitleBarLogo"];
	for (var i = 0; i < g.length; i++) {
		if(!$("#"+g[i]).is(":hidden"))
		{
			$("#"+g[i]).stop();
			$("#"+g[i]).fadeTo( speed , val, function() {
				// Animation complete.
			});
		}
	}
}

function onDocumentMouseDown( event ) {
	//if (BlockDoubleTap()) return;
	event.preventDefault();
	
	FadeMenus(0.2);
	
	isUserInteracting = true;
	isUserDragging = false;
	
	if (event.targetTouches != undefined && event.targetTouches.length > 0) {
		onPointerDownPointerX = event.targetTouches[0].clientX;
		onPointerDownPointerY = event.targetTouches[0].clientY;
	} else {
		onPointerDownPointerX = event.clientX;
		onPointerDownPointerY = event.clientY;
	}
	onPointerDownLon = lon;
	onPointerDownLat = lat;
	
	mouse.x = ( onPointerDownPointerX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( onPointerDownPointerY / window.innerHeight ) * 2 + 1;
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
	
	if ( isUserInteracting === true ) {

		lon = ( onPointerDownPointerX - mousePosX ) * 0.1 + onPointerDownLon;
		lat = ( mousePosY - onPointerDownPointerY ) * 0.1 + onPointerDownLat;

	} else {
		//CheckForPOVIntersection(mouse);
		//CheckForInfoBoxIntersection();
		
		if (INFO_OBJECT == null && INTERSECTED == null) {
			$("#NameBar").hide();
			document.body.style.cursor = "default";
			//document.getElementById("NameBar").innerHTML = "";//"</br>";
		} else {
			document.body.style.cursor = "pointer";
		}
	}
	
	isUserDragging = true;
	var bmx = mouse.x;
	var bmy = mouse.y;
	mouse.x = ( mousePosX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( mousePosY / window.innerHeight ) * 2 + 1;
	// check that the mouse hasn't moved to enable click
	if (bmx-mouse.x == 0 && bmy-mouse.y == 0) { isUserDragging = false; }
	
}

function onDocumentMouseUp( event ) {
	
	if (event != undefined){
		event.stopPropagation();
		event.preventDefault();
	}
	
	isUserInteracting = false;
	
	FadeMenus(1);
	
	if (!isUserDragging) {
		//CheckForPOVIntersection(mouse);
		//CheckForInfoBoxIntersection();
		
		if (INTERSECTED != null) {
			ChangePOV(INTERSECTED.name);
			RefreshZoom();
		}
		if (INFO_OBJECT != null) {
			if (Selected_INFO_OBJECT != undefined) {
				Selected_INFO_OBJECT.children[0].visible = false;
				Selected_INFO_OBJECT.children[0].material.color = new THREE.Color("rgb(20, 160, 230)");
				Selected_INFO_OBJECT.children[0].material.opacity = 0.8;
			}
			if (INFO_OBJECT != Selected_INFO_OBJECT){
				Selected_INFO_OBJECT = INFO_OBJECT;
				Selected_INFO_OBJECT.children[0].visible = true;
				Selected_INFO_OBJECT.children[0].material.color = new THREE.Color("rgb(80, 255, 160)");
				Selected_INFO_OBJECT.children[0].material.opacity = 1;
				WriteAllData(Selected_INFO_OBJECT.info);
				$("#ObjectInfo_CloseButton").show();
			} else {
				CloseObjectInfo();
			}
		}
	}
	isUserDragging = false;
	
}

function onDocumentMouseWheel( event ) {
	// WebKit
	if ( event.wheelDeltaY ) {
		camera.fov -= event.wheelDeltaY * 0.05;
		ZoomValue += event.wheelDeltaY;
	// Opera / Explorer 9
	} else if ( event.wheelDelta ) {
		camera.fov -= event.wheelDelta * 0.05;
		ZoomValue += event.wheelDelta;
	// Firefox
	} else if ( event.detail ) {
		camera.fov += event.detail * 1.0;
		ZoomValue += event.wheelDelta;
	}
	$("#ZoomText")[0].innerText = "Zoom: " + (ZoomValue/120);
	camera.updateProjectionMatrix();
}

// ---------  START LookSelection -----------

var POV_VectorAngles = [];
function GetAllPOVAngles() {
	// get the angle from camera position
	// to the POV
	POV_VectorAngles = [];
	var oldRot = new THREE.Vector3( camera.rotation.x, camera.rotation.y, camera.rotation.z );
	for (var i=0; i < wd.CamPos.length; i++){
		if (wd.CamPos[chosenPOV].name == wd.CamPos[i].name || wd.CamPos[i].name == "Map") continue;
		var vector = new THREE.Vector3( wd.CamPos[i].x, 40, wd.CamPos[i].z );
		
		camera.lookAt( vector );
		
		vector = new THREE.Vector3( camera.rotation.x, camera.rotation.y, camera.rotation.z );
		if (vector.x < 0) vector.x = vector.x + (Math.PI * 2);
		if (vector.y < 0) vector.y = vector.y + (Math.PI * 2);
		if (vector.z < 0) vector.z = vector.z + (Math.PI * 2);
		
		POV_VectorAngles.push({name: wd.CamPos[i].name, vector: vector, index: i});
	}
	camera.rotation.set(oldRot);
}

var hoverTime = 0;
var lasttime;
var iv;
var EnableSelectionTimer;
var noSelect = true;
function LookSelection() {

	// create the look selection timer if it doesn't exist
	if (EnableSelectionTimer == undefined){
		EnableSelectionTimer = setTimeout(function() {
			noSelect = false;
			console.log("select on");
		}, 2 * 1000);
	}

	// what if the camera starts out looking at a target
	//if (noSelect) return;
	
	CheckForPOVIntersection(ScreenCenter);

	if (INTERSECTED != null) {
		ShowNameBar(INTERSECTED.name);
		// Now place the name box over the center div to the top right
		// start the selection timer
		if (iv == undefined) {
			if (isStereo){ $("#DoublePointCirlceLeft, #DoublePointCirlceRight").show();  }
			else { $("#CenterPointCirlce").show(); }
			iv = setInterval(function() {
				if (hoverTime >= Math.PI * 2) {
					clearInterval(iv);
					iv = undefined;
					hoverTime = 0;
					$("#CenterPointCirlce, #DoublePointCirlceLeft, #DoublePointCirlceRight").hide();
					ClearCircles();
					$("#NameBar").hide();
					ChangePOV(INTERSECTED.name);
					RefreshZoom();
				}
				drawSelectionArc();
			}, 1000/30);
		}
	} else {
		$("#NameBar").hide();
		if (iv != undefined) { clearInterval(iv); console.log("end the timer"); }
		iv = undefined;
		hoverTime = 0;
		$("#CenterPointCirlce, #DoublePointCirlceLeft, #DoublePointCirlceRight").hide();
		ClearCircles();
	}
	
	
	return;
	
	var vector = new THREE.Vector3( camera.rotation.x, camera.rotation.y, camera.rotation.z );
	if (vector.x < 0) vector.x = vector.x + (Math.PI * 2);
	if (vector.y < 0) vector.y = vector.y + (Math.PI * 2);
	if (vector.z < 0) vector.z = vector.z + (Math.PI * 2);

	var max = 9999;
	var ind = -1;
	
	for (var i=0; i < POV_VectorAngles.length; i++){
		var cx = Math.abs(vector.x - POV_VectorAngles[i].vector.x);
		var cy = Math.abs(vector.y - POV_VectorAngles[i].vector.y);
		var cz = Math.abs(vector.z - POV_VectorAngles[i].vector.z);
		
		//if (POV_VectorAngles[i].name == "Camera 5") {
		//	console.log("Diff: " + cx, cy, cz + 
		//	"\nPOV: " + POV_VectorAngles[i].vector.x, POV_VectorAngles[i].vector.y, POV_VectorAngles[i].vector.z +
		//	"\nCam: " + vector.x, vector.y, vector.z);
		//}
		
		var feather = 0.04;
		var flip = (Math.PI*2)-feather;
		if ((cx < feather || cx > flip) && (cy < feather || cy > flip) && (cz < feather || cz > flip))
		{
			if (cx+cy+cz < max){
				max = cx+cy+cz;
				ind = i;
			}
		}
		
	}
	
	if (ind != -1) {
		ShowNameBar(POV_VectorAngles[ind].name);
		// Now place the name box over the center div to the top right
		// start the selection timer
		if (iv == undefined) {
			if (isStereo){ $("#DoublePointCirlceLeft, #DoublePointCirlceRight").show();  }
			else { $("#CenterPointCirlce").show(); }
			iv = setInterval(function() {
				if (hoverTime >= Math.PI * 2) {
					clearInterval(iv);
					iv = undefined;
					hoverTime = 0;
					$("#CenterPointCirlce, #DoublePointCirlceLeft, #DoublePointCirlceRight").hide();
					ClearCircles();
					$("#NameBar").hide();
					ChangePOV(POV_VectorAngles[ind].name);
					RefreshZoom();
				}
				drawSelectionArc();
			}, 1000/30);
		}
	} else {
		$("#NameBar").hide();
		if (iv != undefined) { clearInterval(iv); console.log("end the timer"); }
		iv = undefined;
		hoverTime = 0;
		$("#CenterPointCirlce, #DoublePointCirlceLeft, #DoublePointCirlceRight").hide();
		ClearCircles();
	}
}

function ClearCircles() {
	var circles = ["CenterPointCirlce", "DoublePointCirlceRight", "DoublePointCirlceLeft"];
	for (i=0; i<circles.length; i++) {
		var c = document.getElementById( circles[i] );
		var ctx = c.getContext("2d");
		ctx.clearRect(0, 0, c.width, c.height);
	}
}

function drawSelectionArc() {
	var dt = new Date();
	
	if (lasttime == undefined) {
		lasttime = dt.getTime();
	}
	newtime = dt.getTime();
	var difftime = newtime - lasttime;
	lasttime = newtime;
	if (difftime == 0 || difftime > 1000) { return; }
	
	var seconds = 3;
	hoverTime += (difftime/(seconds*1000)) * (Math.PI*4);
	
	var circles = ["CenterPointCirlce", "DoublePointCirlceRight", "DoublePointCirlceLeft"];
	for (i=0; i<circles.length; i++) {
		var c = document.getElementById( circles[i] );
		var ctx = c.getContext("2d");
		ctx.clearRect(0, 0, c.width, c.height);
		ctx.lineWidth = 0.2 + (1.3*hoverTime);
		ctx.strokeStyle = "rgba(255,255,255,0.7)";
		ctx.beginPath();
		ctx.arc(50, 50, 40, false, hoverTime);
		ctx.stroke();
	}
}

// ---------  END LookSelection -----------


function animate() {
	requestAnimationFrame( animate );
	update();
}

function WriteAllData(object) {
	var write = "Object Info:</br>";
	var keys = Object.keys(object);
	var k = "";
	keys.forEach(function(entry) {
		write += entry + ": " + object[entry] +  "</br>" ;
	});
	document.getElementById("ObjectInfoText").innerHTML =  write;
	if (write == "Object Info:</br>"){
		$("#ObjectInfo").stop();
		$("#ObjectInfo").fadeTo( "slow" , 0, function() {
			// Animation complete.
		});
	} 
	else {
		$("#ObjectInfo").stop();
		$("#ObjectInfo").fadeTo( "fast" , 1, function() {
			// Animation complete.
		});
	}
}

function CheckForPOVIntersection(target){
	// called on onDocumentMouseMove
	var vector = new THREE.Vector3( target.x, target.y, 1 );
	//projector.unprojectVector( vector, camera );
	//raycaster.set( camera.position, vector.sub( camera.position ).normalize() );
	raycaster.setFromCamera( target, camera );
	//var recursiveFlag;
	if (!POVsHidden) {
		var intersects = raycaster.intersectObjects( camangles_objs.children );
		//var intersects = raycaster.intersectObjects( objects, recursiveFlag );
		//var intersects = raycaster.intersectObjects( camangles.children );
		if (INTERSECTED != null) {
			INTERSECTED.material.opacity = 0.58;
			if (INTERSECTED.spriteObj != undefined){ INTERSECTED.spriteObj.material.opacity = 0.58; }
			//INTERSECTED.spriteLabel.material.opacity = 0;
			//INTERSECTED.material.color.set( "rgb(30, 30, 180)" );
			//INTERSECTED.material.emissive.set( "black" );
		}
		
		if ( intersects.length > 0 ) {
			//distance = Math.round(intersects[0].distance * 100) * 0.01;
			if ( INTERSECTED != intersects[0].object ) {
				INTERSECTED = intersects[0].object;
			}
		} else {
			INTERSECTED = null;
		}
		
		if (INTERSECTED != null && isMobile == false) {
			
			ShowNameBar(INTERSECTED.name);
			
			//WriteAllData(INTERSECTED.rotation);
			if (INTERSECTED.spriteObj != undefined){ INTERSECTED.spriteObj.material.opacity = 1; }
			INTERSECTED.material.opacity = 1;
			//INTERSECTED.spriteLabel.material.opacity = INTERSECTED.material.opacity;
			//INTERSECTED.material.emissive.set( "rgb(80, 60, 10)" );
			//INTERSECTED.material.color.set( "rgb(80, 60, 10)" );
			
			return true;
		}
		
		return false;
	}
}

function CheckForInfoBoxIntersection(){
	// called on onDocumentMouseMove
	
	//var intersects = raycaster.intersectObjects( infoBoxes.children );
	var intersects = raycaster.intersectObjects( infoBoxes.children );
		
	if (INFO_OBJECT != null && INFO_OBJECT != Selected_INFO_OBJECT) {
		// remove previous hover edits from previous hover object
		//INFO_OBJECT.material.opacity = 0.000001;
		INFO_OBJECT.children[0].visible = false;
	}
	
	if ( intersects.length > 0 ) {
		//distance = Math.round(intersects[0].distance * 100) * 0.01;
		if ( INFO_OBJECT != intersects[0].object ) {
			INFO_OBJECT = intersects[0].object;
		}
	} else {
		INFO_OBJECT = null;
	}
	
	if (INFO_OBJECT != null) {
		ShowNameBar(INFO_OBJECT.name);
		
		// An object has been intersected
		//INFO_OBJECT.material.opacity = 0.38;
		INFO_OBJECT.children[0].visible = true;
		//WriteAllData(INFO_OBJECT.children[0]);//.children[0].visibile = true;
	}
	//================================================
	
}

function NameBarPosition() {
	var namebar = document.getElementById("NameBar");
	if (isAccel){
		namebar.style.left = window.innerWidth/2 - namebar.offsetWidth/2 + "px";
		namebar.style.top = "20%";
	} else {
		namebar.style.left = mousePosX - namebar.offsetWidth/2 + "px";
		namebar.style.top = mousePosY - 60 + "px";
	}
}

function ShowNameBar(txt){
	var namebar = document.getElementById("NameBar");
	namebar.innerText = txt;
	if (!isStereo) $("#NameBar").show();
}

function update() {
	NameBarPosition();
	if (isAccel) { 
		controls.update(); 
		LookSelection();
	} 
	else {
		lat = Math.max( - 85, Math.min( 85, lat ) );
		phi = THREE.Math.degToRad( 90 - lat );
		theta = THREE.Math.degToRad( lon );

		// 50000 is the hypotenuse
		// it does look at a point on the ImageDomes
		camera.target.x = 50000 * Math.sin( phi ) * Math.cos( theta );
		camera.target.y = 50000 * Math.cos( phi );
		camera.target.z = 50000 * Math.sin( phi ) * Math.sin( theta );

		camera.lookAt( camera.target );
		
	}	
	if (isStereo){ 
		effect.render( scene, camera ); 
	}
	else {
		renderer.render( scene, camera );
	}
}