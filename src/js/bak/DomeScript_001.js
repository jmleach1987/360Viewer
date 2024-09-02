import * as THREE from './build/three.module.js?v1.1';
import { DeviceOrientationControls } from './controls/DeviceOrientationControls.js?v1.1';
import { StereoEffect } from './effects/StereoEffect.js?v1.1';
import { DomeProjectData } from '../../assets/uploads/Dome_Projects/DomeProjectsDataList.js?v1.1';
//console.log(new DomeProjectData().data);

// import { CamPos } from '../../assets/uploads/Dome_Projects/4108/Baseline/CamPos.js';

class DomeScript {
	constructor( object ) {

		// when get request is made, alldata() is called
		// app.get('/elements', alldata);
		  
		//function alldata(request, response) {
			  
			// Returns all information about the elements
		//	response.send(elements);
		//}
		//const express = require("express");
		//const app = express();
		//app.get('/elements/:element/', searchElement);
		//function searchElement(request, response) {
		//	var word = request.params.element;
		//	word = word.charAt(0).toUpperCase()
		//		+ word.slice(1).toLowerCase();
			   
		//	if(elements[word]) {
		//		var reply = elements[word];         
		//	}
		//	else {
		//		var reply = {
		//			status:"Not Found"
		//		}
		//	}
			   
		//	response.send(reply);
		//	console.log(reply);
		//}


		function Test() {
			//ImageDome.scale.subScalar(0.1, 0.1, 0.1);
			//ImageDome2.scale.subScalar(0.1, 0.1, 0.1);
		}
		function readTextFile(file, callback) {
			var rawFile = new XMLHttpRequest();
			rawFile.overrideMimeType("application/json");
			rawFile.open("GET", file, true);
			rawFile.onreadystatechange = function() {
				if (rawFile.readyState === 4 && rawFile.status == "200") {
					callback(rawFile.responseText);
				}
			}
			rawFile.send(null);
		}


		// -------- FUTURE ADDITIONS

		// Grab elements, create settings, etc.
		/*
		let video = document.getElementById('video');

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
			let g = "Latitude: " + position.coords.latitude + "<br>Longitude: " + position.coords.longitude;
			document.getElementById("GPS").innerHTML = "GPS coords: " + g;
		}
		*/
		// -------- FUTURE ADDITIONS


		//THREE.SceneUtils.traverseHierarchy( object, function ( object ) { object.visible = false; } );


		// test for sceen size to reduce images
		// also remove menus
		// test for touch capable


		// SceneData.CamPos[0][1][0]
		// line index
		// 0 - camera name, 1 - position array
		// 0 - x, 1 - y, 2 - z



		// ============= Global Values Start =====================

		var clock = new THREE.Clock();

		const uploadsDir = 'https://space.wal-mart.com/3d/assets/uploads/Dome_Projects/';
		// ../../


		let chosenPOV = 0; // index of the current camera
		// loop through on first run to get the index
		// just in case the image loaded is not the first in the list

		// From the chosen camera
		// make the other points at an offset
		// camera will always be at 0,0,0
		// no longer using projector
		let camera, scene, renderer, raycaster, controls, effect, floor, measurecollide;
		let ImageDome, ImageDome2, CurrentDome, OldDome;
		let PositionStart, PositionEnd;
		let lerpFloat = 0;
		//let plight, dirLight;

		let mapVisible = false;
		let mapcard;
		let LastRot = new THREE.Vector2();

		let mouse = new THREE.Vector2();
		
		let onPointerDownPointerX;
		let onPointerDownPointerY;
		let onPointerDownLon;
		let onPointerDownLat;
		
		let ScreenCenter = new THREE.Vector2();

		let InteractionDiv; // this is the div with mouse interaction

		let INTERSECTED;

		let INFO_OBJECT; // the hover info box
		let Selected_INFO_OBJECT; // the selected info box
		let infoBoxes; // the collection of 3d info box objects

		let camangles, camangles_objs; // the sprites and the selection geometry
		let CamerasByDistance = []; // camera names sorted by distance from selected camera

		// for use with the buttons on off state
		let POVsHidden = false;
		let ZoomValue = 0;
		let isStereo = false;
		let isMobile = false;
		let isAccel = false;

		let lowRes = ""; // used to source the images in the low folder

		let locImage; // the location icon. load it once and reuse it

		let isUserInteracting = false, isUserDragging = false,
		onMouseDownMouseX = 0, onMouseDownMouseY = 0,
		lon = 0, onMouseDownLon = 0,
		lat = 0, onMouseDownLat = 0,
		phi = 0, theta = 0;

		let mousePosX = -1;
		let mousePosY = -1;

		let images = new Array();
		let DomeTextures = {};

		let sparkSpriteMap;
		let sparkSpriteMapAerial;

		let DefaultCamera;
		let CameraURL;

		let MeasureEnabled = false;

		let DMGroup;
		let DMProject;
		
		let SceneData;


		// ============= Global Values End =====================





		function onWindowResize() {

			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();

			renderer.setSize( window.innerWidth, window.innerHeight );

			if (effect != undefined) effect.setSize( window.innerWidth, window.innerHeight );

			//DrawMap();
		}


		function Init() {
			
			//console.log(SceneData);
			
			//console.log("TEST COMPLETE");
			//return;
			
			let container = document.getElementById( 'container' );
			InteractionDiv = document.getElementById( 'InteractionDiv' );
			camera = new THREE.PerspectiveCamera( 65, window.innerWidth / window.innerHeight, 1, 100000 );
			camera.target = new THREE.Vector3(0,0,0);
			scene = new THREE.Scene();
			raycaster = new THREE.Raycaster();
			//
			let ImageDomeGeometry = new THREE.SphereGeometry( 500, 60, 40 ); // radius, division height, division width
			let ImageDomeMaterial = new THREE.MeshBasicMaterial({
				side: THREE.BackSide,
				transparent: true,
				opacity: 0,
			});
			ImageDome = new THREE.Mesh( ImageDomeGeometry, ImageDomeMaterial );
			//ImageDomeGeometry.renderOrder = ImageDome.renderOrder = 1;
			ImageDomeMaterial.depthWrite = false;
			if (!SceneData.TextReversed) { 
			
			}
			scene.add(ImageDome);
			//
			let ImageDome2Geometry = new THREE.SphereGeometry( 500, 60, 40 ); // radius, division height, division width
			let ImageDome2Material = new THREE.MeshBasicMaterial({
				side: THREE.BackSide,
				transparent: true,
				opacity: 0,
			});
			ImageDome2 = new THREE.Mesh( ImageDome2Geometry, ImageDome2Material );
			//ImageDome2Geometry.renderOrder = ImageDome2.renderOrder = 2;
			ImageDome2Material.depthWrite = false;
			if (!SceneData.TextReversed) { 
			
			}
			scene.add(ImageDome2);
			//
			// These will flip because I would prefer ImageDome to be first for no reason
			CurrentDome = ImageDome2;
			OldDome = ImageDome;
			
			// Floor
			
			let planegeometry = new THREE.PlaneGeometry( 50010, 50010 );
			let planematerial = new THREE.MeshBasicMaterial({
				side: THREE.DoubleSide,
				visible: false,
			});
			floor = new THREE.Mesh( planegeometry, planematerial );
			floor.rotation.x = Math.PI / 2;
			scene.add( floor );
						
			let measurecollidegeometry = new THREE.PlaneGeometry( 500, 500 );
			let measurecollidematerial = new THREE.MeshBasicMaterial({
				side: THREE.DoubleSide,
				wireframe: true,
				visible: false,
			});
			measurecollide = new THREE.Mesh( measurecollidegeometry, measurecollidematerial );
			scene.add( measurecollide );
			//let gridHelper = new THREE.GridHelper( 10, 30 );
			//measurecollide.add( gridHelper );
			//gridHelper.rotation.x = Math.PI / 2;
			
			//measurecollide.position.set(1979.2212226163674, 0, -2768.025624600168);
			
			
			// ###############

			//dirLight = new THREE.DirectionalLight(0xf1faff, 1);
			//scene.add(dirLight);
			//
			//plight = new THREE.PointLight( 0x7fffd4, 5, 0 ); // 0 means distance is endless
			//scene.add(plight)

			// ############

			renderer = new THREE.WebGLRenderer({antialias: true });
			renderer.setSize( window.innerWidth, window.innerHeight );
			//renderer.gammaInput = true;
			//renderer.gammaOutput = true;
			container.appendChild( renderer.domElement );
			renderer.sortObjects = false; // controls depth sorting, but I'm still not sure how this works
			//renderer.outputEncoding = THREE.sRGBEncoding;

			window.addEventListener( 'resize', onWindowResize, false );

			// ---

			locImage = new Image();
			locImage.src = 'src/img/SparkIcon3.png';

			let texloader = new THREE.TextureLoader();
			let nm = "SparkIcon";
			sparkSpriteMap = texloader.load(locImage.src);
			//
			let src = 'src/img/SparkIconAerial_3.png';
			nm = "SparkIconAerial";
			sparkSpriteMapAerial = texloader.load(src);
			// ---

			DrawOtherPOVs();
			DrawInfoBoxes();
			
			MakeMapCamera();

			createCameraList();
			PreloadLowResTextures();
		}

		// ============= Start up End =====================


		// ============= Mobile Start =====================

		let touched;
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

		function StereoOn(event) {
			if (event != undefined)
			{
				event.stopPropagation();
				event.preventDefault();
			}
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

			//let g = document.getElementById("StereoIcon");
			//if (g.className == "StereoIconOn imageButton") { g.className="StereoIcon imageButton"; document.getElementById("AccelIcon").className="AccelIcon imageButton"; }
			//else { g.className="StereoIconOn imageButton"; document.getElementById("AccelIcon").className="AccelIconOn imageButton"; }

			if (isAccel){
				$("#CenterDiv").show(); } else { $("#CenterDiv").hide(); }

			onWindowResize();
		}

		function AccelOn(event) {
			if (event != undefined)
			{
				event.stopPropagation();
				event.preventDefault();
			}
			//if (BlockDoubleTap()) return;
			$("#CenterDiv").toggle();
			isAccel = !isAccel;
			if (isAccel) AutoRotateOff();
			if (controls == undefined) {
				controls = new THREE.DeviceOrientationControls( camera );
				controls.connect();
			}

			//let g = document.getElementById("AccelIcon");
			//if (g.className == "AccelIconOn imageButton") g.className="AccelIcon imageButton";
			//else { g.className="AccelIconOn imageButton"; }
		}

		// ============= Mobile End =====================


		// ============= Image Loading Start =====================

		/*
		function PreloadButtonImages() {
			// Preload Button images
			let imgs = [
				"home_hover",
				"img",
				"img_hover",
				"img_off",
				"img_off_hover",
				"map",
				"map_hover",
				"pov",
				"pov_hover",
				"pov_off",
				"pov_off_hover",
				"zoom",
				"zoom_hover",
				"autorotate",
				"autorotate_hover",
				"autorotate_off",
				"autorotate_off_hover",
				"home",
				"cameraList",
				"cameraList_hover",
				"accel",
				"accel_hover",
				"stereo",
				"stereo_hover"
			];
			for (let i = 0; i< imgs.length; i++){
				let img = new Image();
				img.src = "src/img/buttons/"+imgs[i]+".png";
			}
		}
		*/

		/*
		//let imageLoadSuccess = true;
		function preloadImages(){
			//_3DLogo = new Image();
			//_3DLogo.src = "src/img/3DLogo.png";
			TitleBar = new Image();
			TitleBar.src = "src/img/TitleBar.png";
			//let t = false;
			//for (let i=0; i < SceneData.CamPos.length; i++){
			//	let img = new Image();
			//	let src = uploadsDir+DMProject+'/' + lowRes + SceneData.CamPos[i].name+'.jpg';
			//	$(img)
			//		.on('load', ImageIsLoaded )
			//		.on('error', function() { 
			//			console.log("error loading image");
			//				if (imageLoadSuccess){
			//					imageLoadSuccess = false;
			//					lowRes = "";
			//					images = [];
			//					preloadImages();
			//				}
			//			})
			//		.attr("src", src)
			//	;
			//	images.push(img);
			//}
		}
		*/

		function PreloadLowResTextures() {
			//preloadImages();

			let nm = "";
			let src = "";

			for (let i=0; i < SceneData.CamPos.length; i++){
				//if (SceneData.CamPos[i].name.indexOf("Map.jpg") != -1) continue;
				//let d = new Date();
				src = uploadsDir + DMGroup + '/' + DMProject + '/' + lowRes + SceneData.CamPos[i].name + '.jpg';//?dummy=' + d.getTime();
				nm = SceneData.CamPos[i].name;
				
				/*
				const ctx = document.createElement('canvas').getContext('2d');
				ctx.canvas.width = 2048;
				ctx.canvas.height = 1024;
				ctx.drawImage(new Image(src, ctx.canvas.width, ctx.canvas.height), 0, 0, ctx.canvas.width, ctx.canvas.height);
				const tex = new THREE.CanvasTexture(ctx.canvas);
				tex.name = nm;
				tex.minFilter = THREE.LinearFilter;
				tex.generateMipmaps = false;
				tex.wrapS = THREE.RepeatWrapping;
				tex.repeat.x = - 1;
				tex.needsUpdate = true;
				DomeTextures[nm] = tex;
				ImageIsLoaded();
				*/
				
				let texloader = new THREE.TextureLoader();
				DomeTextures[nm] = texloader.load(src, function(tex, nm) {
					ImageIsLoaded();
					tex.name = nm;
					tex.minFilter = THREE.LinearFilter;
					tex.generateMipmaps = false;
					tex.wrapS = THREE.RepeatWrapping;
					tex.repeat.x = - 1;
				});
			}
		}


		let hrLoaded = [];
		function UpdateHiResLoadingBar() {
			let loadbarvalue = (hrLoaded.length/SceneData.CamPos.length)*100;
			$("#BGLoadingBar")[0].style.width = loadbarvalue + "%";
			if (loadbarvalue >= 100) { $("#BGLoadingGrp").hide(); return; }
		}

		let PreloadHiResTexture;
		let PreloadHiResTexturesName;
		function PreloadHiResTexturesLoaded() {
			DomeTextures[PreloadHiResTexturesName] = PreloadHiResTexture;
			if (SceneData.CamPos[chosenPOV].name == PreloadHiResTexturesName) ChangePOV(PreloadHiResTexturesName);
			UpdateHiResLoadingBar();
			console.log("HiRes Loaded: " + PreloadHiResTexturesName);
			PreloadHiResTextures();
		}
		function PreloadHiResTextures() {
			let hrimnum;
			for (hrimnum=0; hrimnum < CamerasByDistance.length; hrimnum++){
				if (hrLoaded.indexOf(CamerasByDistance[hrimnum].name) == -1) {
					break;
				}
			}
			if (hrimnum>=CamerasByDistance.length) return; // DOne
			//
			console.log("Loading HiRes: " + CamerasByDistance[hrimnum].name);
			PreloadHiResTexturesName = CamerasByDistance[hrimnum].name;
			hrLoaded.push(PreloadHiResTexturesName);
			let src = uploadsDir + DMGroup + '/' + DMProject + '/' + PreloadHiResTexturesName + '.jpg';
			
			/* // Convert to canvas texture for fade between two textures
			const ctx = document.createElement('canvas').getContext('2d');
			ctx.canvas.width = 4096;
			ctx.canvas.height = 2048;
			//ctx.fillStyle = '#FFF';
			//ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
			ctx.drawImage(new Image(src, ctx.canvas.width, ctx.canvas.height), 0, 0, ctx.canvas.width, ctx.canvas.height);
			const tex = new THREE.CanvasTexture(ctx.canvas);
			tex.minFilter = THREE.LinearFilter;
			tex.generateMipmaps = false;
			tex.wrapS = THREE.RepeatWrapping;
			tex.repeat.x = - 1;
			tex.needsUpdate = true;
			PreloadHiResTexturesLoaded();
			*/
			
			let texloader = new THREE.TextureLoader();
			PreloadHiResTexture = texloader.load(src, function(tex) {
				tex.minFilter = THREE.LinearFilter;
				tex.generateMipmaps = false;
				tex.wrapS = THREE.RepeatWrapping;
				tex.repeat.x = - 1;
				PreloadHiResTexturesLoaded();
			});
			
		}


		let ImagesLoaded = 0;
		function ImageIsLoaded() {
			ImagesLoaded += 1;
			if (ImagesLoaded >= SceneData.CamPos.length) {
				EndLoading();
				$("#Loading").fadeTo( "slow" , 0, function() {
					$("#Loading").hide();
					$("#BGLoadingGrp").fadeIn();
				});
			}
			$("#LoadingWord")[0].innerText = (ImagesLoaded + " / " + (SceneData.CamPos.length));
		}


		function EndLoading(){
			let maxanisotropy = renderer.capabilities.getMaxAnisotropy();
			for (let nm in DomeTextures) {
				DomeTextures[nm].anisotropy = maxanisotropy;
			}

			$("#LoadingWord")[0].innerText = "Complete";

			if (DefaultCamera == undefined) ChangePOV(SceneData.CamPos[0].name);
			else { ChangePOV(DefaultCamera); }
			
			PreloadHiResTextures();

			document.getElementById("MenuButton").addEventListener( 'click', OpenMainMenu, false );
			
			document.getElementById("StereoButton").addEventListener( 'click', StereoOn, false );
			document.getElementById("AccelButton").addEventListener( 'click', AccelOn, false );
			
			document.getElementById("MesW").addEventListener( 'click', MeasureWidth, false );
			document.getElementById("MesH").addEventListener( 'click', MeasureHeight, false );


			document.getElementById("Button_HideShowCameras").addEventListener( 'click', HideShowCameras, false );
			document.getElementById("Button_MapView").addEventListener( 'click', MapView, false );
			document.getElementById("Button_AutoRotateToggle").addEventListener( 'click', AutoRotateToggle, false );
			document.getElementById("Button_RefreshZoom").addEventListener( 'click', RefreshZoom, false );
			document.getElementById("Button_EmailLink").addEventListener( 'click', EmailLink, false );
			document.getElementById("Button_HideShowImage").addEventListener( 'click', HideShowImage, false );
			document.getElementById("Button_HideShowPOVs").addEventListener( 'click', HideShowPOVs, false );
			document.getElementById("Button_ToggleMeasureTool").addEventListener( 'click', ToggleMeasureTool, false );
			document.getElementById("Button_OpenReportContact").addEventListener( 'click', OpenReportContact, false );
			
			document.getElementById("ObjectInfo_CloseButton").addEventListener( 'click', CloseObjectInfo, false );
			document.getElementById("ContactReportButton_CANCEL").addEventListener( 'click', CancelReportContact, false );
			document.getElementById("ContactReportButton_OK").addEventListener( 'click', ReportContact, false );
			document.getElementById("ContactReportButton_CLOSE").addEventListener( 'click', CancelReportContact, false );

			document.getElementById("ContactReportForm").addEventListener( 'change', ContactReport_Changed, false);


			InteractionDiv.addEventListener( 'mousedown', onDocumentMouseDown, false );
			InteractionDiv.addEventListener( 'mousemove', onDocumentMouseMove, false ); //document
			InteractionDiv.addEventListener( 'mouseleave', onDocumentMouseLeave, false ); //document
			InteractionDiv.addEventListener( 'mouseup', onDocumentMouseUp, false ); //
			InteractionDiv.addEventListener( 'mousewheel', onDocumentMouseWheel, false );
			InteractionDiv.addEventListener( 'DOMMouseScroll', onDocumentMouseWheel, false);


			document.getElementById("Test").addEventListener("click", function () { Test(); } );


			if (isMobile) {
				InteractionDiv.addEventListener( 'touchstart', onDocumentMouseDown, false );
				InteractionDiv.addEventListener( 'touchmove', onDocumentMouseMove, false ); //
				InteractionDiv.addEventListener( 'touchend', onDocumentMouseUp, false );

				//$("#ZoomText")[0].addEventListener( 'touchstart', RefreshZoom, false);
				//$("#MapButton")[0].addEventListener( 'touchstart', MapView, false);
				//$("#HideShowImageButton")[0].addEventListener( 'touchstart', HideShowImage, false);
				//$("#HideShowPOVButton")[0].addEventListener( 'touchstart', HideShowPOVs, false);
				//$("#CameraListButton")[0].addEventListener( 'touchstart', HideShowCameras, false);

				//$("#StereoIcon")[0].addEventListener( 'touchstart', StereoOn, false);
				//$("#AccelIcon")[0].addEventListener( 'touchstart', AccelOn, false);
			}

			//$("#TopMessage, #TitleBar").insertBefore("#ButtonBar");
			//$("#SettingButtons").insertAfter("#TitleBarLogo");

			animate();
		}

		// ============= Image Loading End =====================



		// ============= Button Operations Start =====================


		function RefreshZoom(event) {
			//if (BlockDoubleTap()) return;
			if (event != undefined)
			{
				event.stopPropagation();
				event.preventDefault();
			}

			camera.fov = 65;
			ZoomValue = 0;
			$("#ZoomText")[0].innerText = "0";
			camera.updateProjectionMatrix();
		}

		function CloseObjectInfo(event) {
			if (event != undefined)
			{
				event.stopPropagation();
				event.preventDefault();
			}
			
			$("#ObjectInfoArrow").hide();
			$("#ObjectInfo").hide();
			
			if (Selected_INFO_OBJECT != undefined) {
				Selected_INFO_OBJECT.material.opacity = 0.05;
				//Selected_INFO_OBJECT.wire.material.color = new THREE.Color("rgb(20, 160, 230)");
				Selected_INFO_OBJECT.wire.material.opacity = 0.2;
				Selected_INFO_OBJECT = undefined;
			}
		}


		function ButtonBarButtonOnOff(g) {
			//if (g.className != "buttonOff") g.className = "buttonOff";
			//else {g.className = "button";}
		}



		function OpenMainMenu(event) {
			if (event != undefined)
			{
				event.stopPropagation();
				event.preventDefault();
			}

			$("#MainMenu").children().hide();
			$("#MainMenu").css("overflowY","hidden")
			.stop()
			.slideToggle("fast", function() {
				$("#MainMenu").children().fadeIn();
				$("#MainMenu").css("overflowY","auto");
			});
		}


		function HideShowImage(event) {
			//if (BlockDoubleTap()) return;
			if (event != undefined)
			{
				event.stopPropagation();
				event.preventDefault();
			}

			let g = document.getElementById("HideShowImageButton");

			if (ImageDome.material.opacity < 1) {
				ImageDome.material.opacity = 1;
				//g.className = g.className.replace("_Off", "_On");
			} else {
				ImageDome.material.opacity = 0.24;
				//g.className = g.className.replace("_On", "_Off");
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
				if (child.name == SceneData.CamPos[chosenPOV].name) child.visible = false;
			});
			
			infoBoxes.children.forEach( function(child) {
				child.visible = POVsHidden;
			});

			POVsHidden = !POVsHidden;

			//let g = document.getElementById("HideShowPOVButton");
			//if (POVsHidden) g.className = g.className.replace("_On", "_Off");
			//else g.className = g.className.replace("_Off", "_On");

			//if (POVsHidden) { document.getElementById("HideShowPOVButton").innerText = "Show POV Locations"; }
			//else { document.getElementById("HideShowPOVButton").innerText = "Hide POV Locations"; }
		}

		let camlistopen = false;
		function HideShowCameras(event) {
			if (event != undefined)
			{
				event.stopPropagation();
				event.preventDefault();
			}
				
			if (!camlistopen) {
				$("#CameraList").children().hide();
				$("#CameraList")
				.css("overflow","hidden")
				.stop()
				.show()
				.animate({width: "300px"}, "fast", "swing", function() {
					$("#CameraList").children().fadeIn();
					$("#CameraList").css("overflow","auto");
				});
			} else {
				$("#CameraList").children().hide();
				$("#CameraList")
				.css("overflow","hidden")
				.stop()
				.animate({width: "0px"}, "fast", "swing", function() {
					$("#CameraList").hide();
				});
			}
			
			camlistopen = !camlistopen;
			return;
			
			
			$("#CameraList").children().hide();
			$("#CameraList").css("overflowY","hidden")
			.stop()
			.slideToggle("fast", function() {
				$("#CameraList").children().fadeIn();
				$("#CameraList").css("overflowY","auto");
			});
			
			//let g = document.getElementById("CameraListButton");
			//if (g.className == "CameraListButtonOn imageButton") g.className="CameraListButton imageButton";
			//else { g.className="CameraListButtonOn imageButton"; }
			//}
		}


		// --------- Auto Rotate -----------

		let autoRotateinc = 0;
		let autoRotatemax = 0.03;
		let disableAutoRotate = false;
		function AutoRotateToggle(event) {
			if (event != undefined)
			{
				event.stopPropagation();
				event.preventDefault();
			}
			disableAutoRotate = !disableAutoRotate;
			let g = document.getElementById("AutoRotateButton");
			//ButtonBarButtonOnOff(g);
			//console.log(disableAutoRotate);
			if (!disableAutoRotate) {
			//	g.className = g.className.replace("_Off", "_On");
				autoRotateinc = 0;
			}
			else {
			//	g.className = g.className.replace("_On", "_Off"); 
			}
		}
		function AutoRotateOff(event) {
			if (event != undefined)
			{
				event.stopPropagation();
				event.preventDefault();
			}
			disableAutoRotate = true;
			autoRotateinc = 0;
			//let g = document.getElementById("AutoRotateButton");
			//g.className = g.className.replace("_On", "_Off");
		}


		function ToggleMeasureTool(event) {
			if (event != undefined)
			{
				event.stopPropagation();
				event.preventDefault();
			}
			MeasureEnabled = !MeasureEnabled;
			$("#MeasureText").fadeToggle("fast");
			if (MeasureObjs != undefined) { MeasureObjs.visible = MeasureEnabled; }
			HideShowPOVs();
			
			$("#MeasureMenu").stop().fadeToggle("fast", function() {});
		}
		let measureWidth = true;
		function MeasureWidth(event) {
			if (event != undefined)
			{
				event.stopPropagation();
				event.preventDefault();
			}
			measureWidth = true;
			document.getElementById("MesH").className = "MainMenuButton";
			document.getElementById("MesW").className = "MainMenuButton MeasureOn";
		}
		function MeasureHeight(event) {
			if (event != undefined)
			{
				event.stopPropagation();
				event.preventDefault();
			}
			measureWidth = false;
			document.getElementById("MesW").className = "MainMenuButton";
			document.getElementById("MesH").className = "MainMenuButton MeasureOn";
			console.log("CHANGED");
		}


		function EmailLink(event) {
			if (event != undefined)
			{
				event.stopPropagation();
				event.preventDefault();
			}
			let subject= "3D Dome Viewer: " + DMGroup + " - " + DMProject;
			let body = "Here is the " + DMGroup + " - " + DMProject + " 3D Dome Viewer project for your review:\r\n\r\n<";
			body += CameraURL; //window.location.href;
			body += ">";
			
			let uri = "mailto:?subject=";
			uri += encodeURIComponent(subject);
			uri += "&body=";
			uri += encodeURIComponent(body);
			window.open(uri, '_self');
		}


		let contacttype;
		function OpenReportContact(event) {
			if (event != undefined)
			{
				event.stopPropagation();
				event.preventDefault();
			}
			$("#ContactReport").fadeIn("fast");
			document.getElementById("ContactReportButton_OK").disabled = true;
		}
		function CancelReportContact(event) {
			if (event != undefined)
			{
				event.stopPropagation();
				event.preventDefault();
			}
			$("#ContactReport").fadeOut("fast");
			document.getElementById("ContactReportButton_OK").disabled = true;
		}
		function ContactReport_Changed(event) {
			if (event != undefined)
			{
				event.stopPropagation();
				event.preventDefault();
			}
			$("#ContactReportForm").find("input").each(function(){
				if(this.checked) {
					contacttype = this.value;
				}
			});
			if (contacttype != undefined) {
				document.getElementById("ContactReportButton_OK").disabled = false;
			}
		}
		function ReportContact(event) {
			if (event != undefined)
			{
				event.stopPropagation();
				event.preventDefault();
			}
			// Incorrect Visual Element
			// Request a Feature
			// Report a bug
			$("#ContactReport").fadeOut("fast");
			let subject= "3D Dome Viewer - " + contacttype + ": " + DMGroup + " - " + DMProject;
			if (contacttype == "Incorrect Visual Element") {
				contacttype = "point out an " + contacttype;
			}
			let body = "Hey 3D team,\r\n\r\nI'd like to " + contacttype + ": \r\n\r\n\r\n\r\n<";
			body += CameraURL;
			body += ">";
			
			let uri = "mailto:3ddesign@wal-mart.com?subject=";
			uri += encodeURIComponent(subject);
			uri += "&body=";
			uri += encodeURIComponent(body);
			window.open(uri, '_self');
		}

		// ============= Button Operations End =====================


		// ============= Map Start =====================



		function MakeMapCamera() {
			
			let mapimage = new Image();
			mapimage.src = uploadsDir + DMGroup + '/' + DMProject + '/map.jpg';

			let texloader = new THREE.TextureLoader();
			let mapmap = texloader.load(mapimage.src);
			
			// camera.fov is 65
			// camera.aspect is 1.44
			
			let dist = 50000;
			// 1.77 is 1920x1080 - the map image dimension
			// 1.384 is the distance in maya when the card scale is 1.77
			let scalex = dist * (1.77 / 1.384); 
			let scaley = scalex / 1.77;
			let geometry = new THREE.PlaneGeometry( scalex, scaley ); // radius, division height, division width
			let MapMaterial = new THREE.MeshBasicMaterial({
				side: THREE.DoubleSide,
				map: mapmap,
			});
			mapcard = new THREE.Mesh( geometry, MapMaterial );
			mapcard.visible = false;
			//floor.rotation.x = Math.PI / 2;
			scene.add( mapcard );
			
		}
		
		
		
		
		function DrawMap() {
			mapcard.visible = true;
			ImageDome.visible = false;
			
			camera.position.set( SceneData.MapCam.x, SceneData.MapCam.y, SceneData.MapCam.z );
			
			camangles.children.forEach( function(child) {
				child.visible = !POVsHidden;
			});
			
			let rot = new THREE.Vector3(
				THREE.Math.degToRad( SceneData.MapCam.rx ),
				-THREE.Math.degToRad( SceneData.MapCam.ry ),
				THREE.Math.degToRad( SceneData.MapCam.rz )
				);
			
			
			//let g = new THREE.Euler();
			//g.setFromVector3(rot);
			//console.log(camera.rotation, g);
			
			//console.log(SceneData.MapCam.rz);
			//console.log(lat, lon);
			
			LastRot.x = lat;
			LastRot.y = lon;
			camera.fov = 39;
			for (let i = 0; i < 5; i++) {
				lat = SceneData.MapCam.rz;
				lon = SceneData.MapCam.ry;
				
				// --- copied from anim
				lat = Math.max( - 85, Math.min( 85, lat ) );
				phi = THREE.Math.degToRad( 90 - lat );
				theta = THREE.Math.degToRad( lon );

				// 50000 is the hypotenuse
				// it does look at a point on the ImageDomes
				camera.target.x = 50000 * Math.sin( phi ) * Math.cos( theta );
				camera.target.y = 50000 * Math.cos( phi );
				camera.target.z = 50000 * Math.sin( phi ) * Math.sin( theta );

				camera.lookAt( camera.target );
				
				// ---
				
				mapcard.lookAt(camera.position);
				mapcard.position.copy(camera.target);
				
				camera.updateProjectionMatrix ();
			}
			
			disableAutoRotate = true;
			
			
		}
		function UpdateMap() {
			
		}
		
		/*
		function DrawMap() {
			let map=document.getElementById("Map");
			let grp=document.getElementById("MapObjectGrp");
			let viewcone=document.getElementById("viewcone");

			map.width = window.innerWidth;
			map.height = window.innerHeight;
			let children = grp.children;
			for (let i = 0; i < children.length; i++) {
				grp.removeChild(children[i]);
			}
			grp.innerHTML = "";

			let lowestX = 99999;
			let lowestZ = 99999;
			let highestX = -99999;
			let highestZ = -99999;
			for (let i=0; i<SceneData.CamPos.length; i++) {
				if (highestX < SceneData.CamPos[i].x) highestX = SceneData.CamPos[i].x;
				if (highestZ < SceneData.CamPos[i].z) highestZ = SceneData.CamPos[i].z;
				if (lowestX > SceneData.CamPos[i].x) lowestX = SceneData.CamPos[i].x;
				if (lowestZ > SceneData.CamPos[i].z) lowestZ = SceneData.CamPos[i].z;
			}

			highestX = highestX - lowestX;
			highestZ = highestZ - lowestZ;
			let sc = 0.6;
			sc = (map.width/highestX)*sc;

			let vw = 700*sc;
			viewcone.width = vw
			let rad = (lon/180*Math.PI) + (Math.PI/2);

			viewcone.style.transform = "rotate("+rad+"rad)";
			let side = vw/2;
			let hyp = Math.sqrt( (side*side) + (side*side) );
			hyp *= 0.8;
			let vcl = Math.cos(rad-(Math.PI/2)) * hyp;
			let vct = Math.sin(rad-(Math.PI/2)) * hyp;

			for (let i=0; i<SceneData.CamPos.length; i++) {
				let newDiv = document.createElement('button');
				newDiv.camname = SceneData.CamPos[i].name;
				newDiv.style.position = "absolute";
				newDiv.style.borderRadius = "4px";
				let left = ((SceneData.CamPos[i].x-lowestX)*sc) - ((highestX*sc)/2) - (15/2);
				let top = ((SceneData.CamPos[i].z-lowestZ)*sc) - ((highestZ*sc)/2) - (15/2);
				newDiv.id = "mappos_"+i;
				newDiv.style.left = left + "px";
				newDiv.style.top  = top + "px";
				newDiv.style.width =
				newDiv.style.height = "15px";
				newDiv.num = i;
				newDiv.style.backgroundColor = "transparent";//"rgb(180,80,60)";
				newDiv.innerHTML = "<img src=" + locImage.src + " width=10 height=15/>";
				if (chosenPOV == i) {
					newDiv.style.backgroundColor = "rgb(130,230,130)";
					viewcone.style.left = (map.width/2) + left + (15/2) - side + vcl + "px";
					viewcone.style.top = (map.height/2) + top + (15/2) - side + vct + "px";
				}
				//newDiv.style.borderStyle = "solid";
				//newDiv.style.borderColor = "white, black";
				//newDiv.style.borderWidth = "1px 2px 3px 2px";
				newDiv.style.cursor = "pointer";
				newDiv.onmouseover = function(){
					let hoverText = document.getElementById("Map_CameraName");
					hoverText.style.left = $(this).offset().left + 20 + "px";
					hoverText.style.top = $(this).offset().top - 20 + "px";
					hoverText.innerText = this.camname;
					if (chosenPOV != this.num) this.style.backgroundColor = "rgb(255,120,120)";
					$(hoverText).fadeIn(100);
				};
				newDiv.onmouseleave = function(){ 
					//newDiv.style.cursor = "default";
					let hoverText = document.getElementById("Map_CameraName");
					if (chosenPOV != this.num) this.style.backgroundColor = "transparent";//"rgb(180,80,60)";
					$(hoverText).hide();
				};
				newDiv.onclick = function() { 
					ChangePOV(this.camname); mapVisible = false; $("#Map").hide(); }
				grp.appendChild(newDiv);
			}
		}

		function UpdateMap() {
			let map=document.getElementById("Map");
			let grp=document.getElementById("MapObjectGrp");
			let viewcone=document.getElementById("viewcone");

			map.width = window.innerWidth;
			map.height = window.innerHeight;

			let lowestX = 99999;
			let lowestZ = 99999;
			let highestX = -99999;
			let highestZ = -99999;
			for (let i=0; i<SceneData.CamPos.length; i++) {
				if (highestX < SceneData.CamPos[i].x) highestX = SceneData.CamPos[i].x;
				if (highestZ < SceneData.CamPos[i].z) highestZ = SceneData.CamPos[i].z;
				if (lowestX > SceneData.CamPos[i].x) lowestX = SceneData.CamPos[i].x;
				if (lowestZ > SceneData.CamPos[i].z) lowestZ = SceneData.CamPos[i].z;
			}

			highestX = highestX - lowestX;
			highestZ = highestZ - lowestZ;
			let sc = 0.6;
			sc = (map.width/highestX)*sc;

			let vw = 700*sc;
			viewcone.width = vw
			let rad = (lon/180*Math.PI) + (Math.PI/2);

			viewcone.style.transform = "rotate("+rad+"rad)";
			let side = vw/2;
			let hyp = Math.sqrt( (side*side) + (side*side) );
			hyp *= 0.8;
			let vcl = Math.cos(rad-(Math.PI/2)) * hyp;
			let vct = Math.sin(rad-(Math.PI/2)) * hyp;

			for (let i=0; i<SceneData.CamPos.length; i++) {
				let newDiv = document.getElementById("mappos_"+i);
				if (newDiv == undefined) continue;
				let left = ((SceneData.CamPos[i].x-lowestX)*sc) - ((highestX*sc)/2) - (15/2);
				let top = ((SceneData.CamPos[i].z-lowestZ)*sc) - ((highestZ*sc)/2) - (15/2);
				if (chosenPOV == i) {
					newDiv.style.backgroundColor = "rgb(130,230,130)";
					viewcone.style.left = (map.width/2) + left + (15/2) - side + vcl + "px";
					viewcone.style.top = (map.height/2) + top + (15/2) - side + vct + "px";
				}
			}
		}
		*/

		function MapView(event) {
			if (event != undefined)
			{
				event.stopPropagation();
				event.preventDefault();
			}
			DrawMap();
			mapVisible = true;
			//$("#Map").fadeIn(300);
		}

		// ============= Map End =================


		function ShowVersionCameraButtons(CamPosName) {

			// remove all children
			const myNode = document.getElementById("CameraVersions");
			while (myNode.firstChild) {
				myNode.removeChild(myNode.lastChild);
			}
			
			for (let i=0; i < camangles_objs.children.length; i++) {
				if (camangles_objs.children[i].name == CamPosName) {
					
					let vs = camangles_objs.children[i].CameraVersions;
					
					if (vs.length > 1) {
					
						for (let j=0; j < vs.length; j++) {
							
							let cvb = document.createElement('button');
							cvb.type = "button";
							cvb.className = "ButtonBarButton";
							cvb.textContent = vs[j];
							myNode.appendChild(cvb);
							
							cvb.addEventListener('click', function(){ ChangePOV(vs[j]); }, false);
							
						}
					}
				}
			}
		}

		// ============= Camera position Start =====================


		function ChangePOV(camName){
			EnableSelectionTimer = undefined;
			noSelect = true;
			mapVisible = false;
			
			CloseObjectInfo();

			//scene.remove(scene.children); // i dont know why i have this
			$(".camListButtonsOn").attr('class', 'camListButtons');

			for (let i=0; i < SceneData.CamPos.length; i++){
				chosenPOV = i;
				if (camName == SceneData.CamPos[i].name) break;
			}

			if (mapcard.visible) {
				lat = LastRot.x;
				lon = LastRot.y;
				camera.fov = 65;
			}
			mapcard.visible = false;

			SceneData.CamPos[chosenPOV].button.className = "camListButtons camListButtonsOn";
			
			PositionRig();
			
			ShowHideInfoBoxesByCamera(camName);
			ShowVersionCameraButtons(camName);

			GetAllPOVAngles();

			if (camangles == undefined || camangles_objs == undefined) return;
			camangles.children.forEach( function(child) {
				child.visible = !POVsHidden;
			});
			camangles.children[chosenPOV].visible = false;
			camangles_objs.children.forEach( function(child) {
				child.visible = !POVsHidden;
				if (child.name == camName) child.visible = false;
			});
			//LoadSpecificHiRes();
			SparkIconDepthOpacity();
						
			// Add the camera to the address
			// Get the project from the address bar
			let loc = location.href;
			let b = loc.split("?");
			if (b.length >= 3) {
				while (camName.indexOf(" ") > -1) {
					camName = camName.replace(" ", "%20")
				}
				let newref = "";
				for (let i=0; i<3; i++) {
					if (newref != "") newref += "?";
					newref += b[i];
				}
				CameraURL = newref + "?" + camName;
			}
		}


		function PositionRig() {
			let pos = new THREE.Vector3(
				SceneData.CamPos[chosenPOV].x,
				SceneData.CamPos[chosenPOV].y,
				SceneData.CamPos[chosenPOV].z
				);
			/*let look = new THREE.Vector3(
				SceneData.CamPos[chosenPOV].lookx,
				SceneData.CamPos[chosenPOV].looky,
				SceneData.CamPos[chosenPOV].lookz
				);*/

			if (CurrentDome == ImageDome)
			{ 
				CurrentDome = ImageDome2;
				OldDome = ImageDome;
			}
			else{ 
				CurrentDome = ImageDome;
				OldDome = ImageDome2;
			}

			// is this the first position
			if (PositionStart == undefined) {
				PositionEnd = PositionStart = pos;
				camera.position.copy( pos );
			} else {
				PositionStart.copy(camera.position);
				PositionEnd.copy(pos);
			}
			
			CurrentDome.position.copy( pos );
			
			//ImageDome2.position.set( pos.x+0.2, pos.y, pos.z );
			// Rotates the sphere to be at the correct world orientation
			if (SceneData.flip != undefined) {
				//console.log("Flipped");
				CurrentDome.rotation.y = THREE.Math.degToRad( -180 );
			} else {
				if (SceneData.CamPos[chosenPOV].ry == undefined){
					CurrentDome.rotation.y = THREE.Math.degToRad( 90 );
					//console.log("No Rotation");
				} else {
					CurrentDome.rotation.y = THREE.Math.degToRad( SceneData.CamPos[chosenPOV].ry+90 );
				}
			}
			
			let domeImage = SceneData.CamPos[chosenPOV].name;
			CurrentDome.material.map = DomeTextures[domeImage];
			CurrentDome.visible = true;
			CurrentDome.material.needsUpdate = true;
			
			//let domeImage2 = SceneData.CamPos[chosenPOV].name;
			//ImageDome2.material.map = DomeTextures["DomeViewer5"];
			//ImageDome2.visible = true;
			//ImageDome2.material.needsUpdate = true;
			//ImageDome2.rotation.y = ImageDome.rotation.y;

			//if (ImageDome.material.envMap != undefined) {
			//	ImageDome.material.envMap = ImageDome.material.map;
			//}
			//THREE.ImageUtils.loadTexture( uploadsDir + DMProject + '/' + lowRes + SceneData.CamPos[chosenPOV].name +'.jpg' );
			//

			//plight.position.set( pos.x, pos.y-100, pos.z );
			//dirLight.position.set(pos.x, pos.y+200, pos.z);
			//dirLight.target.position.set(pos.x, pos.y, pos.z);
			lerpFloat = 0;
		}


		function createCameraList() {
			let camlist = document.getElementById("CameraList");
			let i = 0;
			camangles.children.forEach( function(child) {
				let nb = document.createElement("button");
				SceneData.CamPos[i].button = nb; i++;
				nb.innerText = child.name.replace("_", " ");
				nb.alt = child.name;
				nb.className = "camListButtons";
				nb.onclick = nb.ontouchstart = function(){
					//console.log("BUTTON");
					ChangePOV(this.alt);
					return false;
				};
				camlist.appendChild(nb);
			});
		}


		

		function DrawSparkSprite(pos, floor) {
			let spriteMap = sparkSpriteMap;
			if (pos.y - floor > 70) spriteMap = sparkSpriteMapAerial;

			let spriteMaterial = new THREE.SpriteMaterial( { map: spriteMap } );
				//color: 0xffffff	} );
			//spriteMaterial.depthWrite = false;
			let sprite = new THREE.Sprite( spriteMaterial );
			let width = 256;
			let height = 512;
			if (pos.y - floor > 70) height = pos.y;//height = 1536;
			let sc = 0.08;
			sprite.scale.set(width*sc, height*sc, 1);
			sprite.position.set(pos.x,(height*sc)/2,pos.z);
			//sprite.renderOrder = 10;
			//scene.add(sprite);
			return sprite;
		}

		function SparkIconDepthOpacity() {
			
			if (camangles == undefined || camangles_objs == undefined) return;
			
			CamerasByDistance = [];
			let d = {};
			
			// use their distance as their opacity
			camangles.children.forEach( function(child) {
				let dist = camera.position.distanceTo(child.position);
				d[dist] = child;
				dist = (500/dist) * 0.6;
				if (dist > 0.95) dist = 0.95;
				if (dist < 0.01) dist = 0.01;
				child.material.opacity = dist;
				child.defaultOpacity = dist;
			});
			
			// Add the cameras in order by distance
			let keys = Object.keys(d);
			keys.sort((a, b) => a - b);
			for (let i=0; i < keys.length; i++) {
				let k = keys[i];
				CamerasByDistance.push(d[k]);
			}
		}


		function DrawOtherPOVs(){
			
			camangles = new THREE.Object3D();
			camangles.name = "camangles";
			camangles_objs = new THREE.Object3D();
			camangles_objs.name = "camangles_objs";

			let findSamePos = {};

			for (let i=0; i < SceneData.CamPos.length; i++){
				let cm = SceneData.CamPos[i];
				let pos = new THREE.Vector3(cm.x, cm.y, cm.z);
				//let rot = new THREE.Vector3(cm.rx, cm.ry, cm.rz);

				let floor = 0;
				if (cm.floor != undefined) { floor = cm.floor; }

				let sprite = DrawSparkSprite(pos, floor);
				sprite.name = cm.name;
				sprite.material.opacity = 0.80;
				camangles.add( sprite );
				
				let id = pos.x + "," + pos.y + "," + pos.z;
				if (findSamePos[id] == undefined) { findSamePos[id] = []; }
				findSamePos[id].push(cm.name);
								
				/*while (rot.y > 360){ rot.y -= 360; }
				while (rot.y < 0){ rot.y += 360; }
				rot.x = THREE.Math.degToRad(rot.x-90);
				rot.y = THREE.Math.degToRad(rot.y);
				rot.z = THREE.Math.degToRad(rot.z);*/

				// this is the objects material for clicks
				let material = new THREE.MeshLambertMaterial({
					color: "rgb(0, 0, 0)",
					emissive: "rgb(255,0,0)",
					//side: THREE.SingleSide,
					transparent: true,
					opacity: 0.28,
					visible: false, // hides the object but it is still raycast-able
				});
				//material.depthWrite = false;
				
				
				let ht = 29;
				if (pos.y > 70) ht = 112;
				/*
				let geometry = new THREE.ConeGeometry( 11, ht, 32 );
				//let geometry = new THREE.BoxGeometry( 22, ht, 22 );
				//let geometry = new THREE.SphereGeometry( 2.8, 40, 30 );
				mesh = new THREE.Mesh( geometry, material );
				mesh.name = cm.name;
				mesh.position.set(pos.x, ht/2-5, pos.z);
				//mesh.scale.y = 3.2;
				mesh.rotation.set(0,0,3.1415);
				mesh.spriteObj = sprite;
				camangles_objs.add( mesh );*/

				let geometry = new THREE.SphereGeometry( 10, 20, 20 );
				let mesh = new THREE.Mesh( geometry, material );
				mesh.name = cm.name;
				mesh.position.set(pos.x, ht, pos.z);
				mesh.spriteObj = sprite;
				camangles_objs.add( mesh );
				
				mesh.CameraVersions = findSamePos[id];

			}
			scene.add(camangles);
			scene.add(camangles_objs);
			
			//
		}

		// ============= Camera position End =====================



		// ============= Measure Tool =====================



		let MeasureObjs;
		let MeasurePoints = [];
		let MeasureClick = 0;
		function CreateMeasurePoint() {

			MeasureClick+=1;
			
			if (MeasureClick == 3) {
				MeasurePoints.push(MeasureObjs);
				for (let i=0; i<MeasurePoints.length; i++) {
					scene.remove(MeasurePoints[i]);
					if (MeasurePoints[i].geometry != undefined) MeasurePoints[i].geometry.dispose();
					if (MeasurePoints[i].material != undefined) MeasurePoints[i].material.dispose();
					MeasurePoints[i] = undefined;
				}
				MeasurePoints = [];
				MeasureClick = 1;
			}
			
			let sz = 1;
			if (MeasureClick == 1) {
				MeasureObjs = new THREE.Object3D();
				MeasureObjs.name = "MeasureObjs";
				scene.add(MeasureObjs);

				let material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
				let geometry = new THREE.SphereGeometry( sz, 20 );
				let mesh1 = new THREE.Mesh( geometry, material );
				MeasureObjs.add( mesh1 );
				MeasurePoints.push(mesh1); // 0
				
				let mesh2 = new THREE.Mesh( geometry, material );
				MeasureObjs.add( mesh2 );
				MeasurePoints.push(mesh2); // 1
				
				let mesh3geometry = new THREE.CylinderGeometry( sz/3, sz/3, 1, 3 );
				let mesh3 = new THREE.Mesh( mesh3geometry, material );
				let pivotOffset = new THREE.Object3D();
				pivotOffset.add( mesh3 );
				mesh3.rotation.set(90/180*Math.PI,0,0);
				MeasureObjs.add( pivotOffset );
				MeasurePoints.push(pivotOffset); // 2
				
				raycaster.setFromCamera( mouse, camera );
				let intersects = raycaster.intersectObjects( [floor] );
				if ( intersects.length > 0 ) {
					mesh1.position.set(intersects[0].point.x, 0, intersects[0].point.z);
					mesh2.position.set(intersects[0].point.x, 0, intersects[0].point.z);
					pivotOffset.position.set(intersects[0].point.x, 0, intersects[0].point.z);
				}
			}
		}

		let measuredist;
		function MoveMeasure() {
			
			raycaster.setFromCamera( mouse, camera );
			let intersects;
			
			if (measureWidth) {
				intersects = raycaster.intersectObjects( [floor] );
			} else {
				intersects = raycaster.intersectObjects( [measurecollide] );
				// console.log(intersects);
			}
			
			//if (intersects.length > 0) console.log(intersects[0]);
			
			if ( measureWidth && intersects.length > 0 && MeasureClick <= 1 ) {
				MeasurePoints[1].position.set(intersects[0].point.x, 0, intersects[0].point.z);
				
				measuredist = MeasurePoints[0].position.distanceTo(intersects[0].point);
				let px = intersects[0].point.x - MeasurePoints[0].position.x;
				let pz = intersects[0].point.z - MeasurePoints[0].position.z;
				let rad = Math.atan2(pz, px);
				
				let fifrad = (15/180*Math.PI);
				rad = Math.floor(rad / fifrad);
				rad *= fifrad;
				
				MeasurePoints[1].position.set(
					MeasurePoints[0].position.x + (Math.cos(rad)*measuredist),
					0,
					MeasurePoints[0].position.z + (Math.sin(rad)*measuredist),
				);
				
				MeasurePoints[2].lookAt(MeasurePoints[1].position); // cone look at second point
				MeasurePoints[2].children[0].scale.set(1, measuredist, 1);
				MeasurePoints[2].children[0].position.set(0, 0, measuredist/2);
			}
			
			if ( !measureWidth && intersects.length > 0 && MeasureClick <= 1 ) {
				MeasurePoints[1].position.set(
					MeasurePoints[1].position.x,
					intersects[0].point.y,
					MeasurePoints[1].position.z);
				measuredist = MeasurePoints[0].position.distanceTo(MeasurePoints[1].position);
				MeasurePoints[2].lookAt(MeasurePoints[1].position); // cone look at second point
				MeasurePoints[2].children[0].scale.set(1, measuredist, 1);
				MeasurePoints[2].children[0].position.set(0, 0, measuredist/2);
			}
			
			
			// round to 16th
			let measuredist2 = Math.abs(measuredist);
			let ft = Math.floor(measuredist2/12);
			let inch = Math.floor(measuredist2 - (ft*12));
			let fraction = Math.floor((measuredist2 - inch - (ft*12)) * 10);
			let fractions = ["1/16", "1/8", "3/16", "1/4", "5/16", "3/8", "7/16", "1/2", "9/16", "5/8", "11/16", "3/4", "13/16", "7/8", "15/16"];
			fraction = fractions[fraction];
			MeasureText.innerHTML = "<p style=\"font-size: 1.1em;\">" + ft + "' - " + inch + " <span style=\"font-size: 0.76em;\">" + fraction + "</span>\"</p>";

			// ---
			
			measurecollide.position.set( 
				MeasurePoints[0].position.x, 
				MeasurePoints[0].position.y, 
				MeasurePoints[0].position.z
				);
			let lk = camera.position.clone();
			lk.y = 0;
			measurecollide.lookAt(lk);
			
			// ---
			
			let pos1 = ObjectCenterToScreenPos(MeasurePoints[0]);
			let pos2 = ObjectCenterToScreenPos(MeasurePoints[1]);
			// the x,y coordinates relative to pos1
			let hx = (pos2.x-pos1.x);
			let hy = (pos2.y-pos1.y);
			// half the x,y coordinates relative to pos1
			hx *= 0.5;
			hy *= 0.5;
			pos1.x = pos1.x + hx - 20;
			pos1.y = pos1.y + hy + 20;
			let MeasureTextWidth = document.getElementById("MeasureText").offsetWidth / 2;
			MeasureText.style.top = pos1.y + "px";
			MeasureText.style.left = pos1.x - MeasureTextWidth + "px";
			
		}




		// ============== Measure Tool End ===================








		// ============= Info Boxes =====================

		function DrawInfoBoxes(){
			infoBoxes = new THREE.Object3D();
			infoBoxes.name = "infoBoxes";
			if (SceneData.InfoBoxPos == undefined) return;
			for (let i=0; i < SceneData.InfoBoxPos.length; i++){

				let material = new THREE.MeshBasicMaterial({
					color: SceneData.InfoBoxPos[i].color,
					//side: THREE.SingleSide,
					transparent: true,
					opacity: 0.05,
					//opacity: 0.2,
					visible: true
				} );

				let pos = new THREE.Vector3(
					SceneData.InfoBoxPos[i].x,// - SceneData.InfoBoxPos[i].wx/2, 
					SceneData.InfoBoxPos[i].y,// + SceneData.InfoBoxPos[i].hy/2, 
					SceneData.InfoBoxPos[i].z,// + SceneData.InfoBoxPos[i].dz/2
					);

				let rot = new THREE.Vector3(
					THREE.Math.degToRad( SceneData.InfoBoxPos[i].rx ),
					-THREE.Math.degToRad( SceneData.InfoBoxPos[i].ry ),
					THREE.Math.degToRad( SceneData.InfoBoxPos[i].rz )
					);
				

				let piv = new THREE.Vector3(SceneData.InfoBoxPos[i].pivx, SceneData.InfoBoxPos[i].pivy, SceneData.InfoBoxPos[i].pivz);

				let mesh = new THREE.BoxGeometry(SceneData.InfoBoxPos[i].wx-1, SceneData.InfoBoxPos[i].hy-1, SceneData.InfoBoxPos[i].dz-1);
				let mesh2 = new THREE.BoxGeometry(SceneData.InfoBoxPos[i].wx, SceneData.InfoBoxPos[i].hy, SceneData.InfoBoxPos[i].dz);
				
				let cube = new THREE.Mesh(mesh, material);
				let cube2 = new THREE.Mesh(mesh2, material);

				let infoPoint = new THREE.Object3D();
				infoPoint.name = "infoPoint";
				cube.infoPoint = infoPoint;

				let wire = new THREE.BoxHelper( cube2, new THREE.Color(SceneData.InfoBoxPos[i].color) );
				wire.material.transparent = true;
				wire.material.opacity = 0.2;
				wire.renderOrder = 1;
				cube.add(wire);
				cube.wire = wire;
				cube.name = SceneData.InfoBoxPos[i].name;
				
				cube.position.set(pos.x, pos.y, pos.z);
				cube.rotation.set( rot.x, rot.y, rot.z );

				cube.info = SceneData.InfoBoxPos[i];

				//if (SceneData.InfoBoxPos[i].pdf_link == undefined){cube.info["pdf_link"] = "";}

				cube.camgroup = SceneData.InfoBoxPos[i].cameras.split(",");
				
				infoBoxes.add(cube);
				
				infoPoint.position.set(piv.x, piv.y, piv.z);
				cube.attach(infoPoint);
				
				/*
				// visible pivot point
				let materialTEST = new THREE.MeshBasicMaterial({
				color: SceneData.InfoBoxPos[i].color,
				visible: true
				} );
				let meshTEST = new THREE.SphereGeometry(1,4,4);
				let cubeTEST = new THREE.Mesh(meshTEST, materialTEST);
				let pp = new THREE.Vector3();
				infoPoint.getWorldPosition(pp);
				cubeTEST.position.copy(pp);
				scene.add(cubeTEST);
				*/

			}
			scene.add(infoBoxes);
			
			
		}

		function ShowHideInfoBoxesByCamera(CamPosName) {
			infoBoxes.children.forEach( function(child) {
				child.visible = (child.camgroup.indexOf(CamPosName) > -1);
				//console.log(child);
			});
		}

		// ============= Info Boxes =====================



		// ================= Interaction Start ===============


		function FadeMenus(val) {
			let speed = "fast";
			if (val > 0.5) { speed = 1000; } // the low is not 0, but 0.2 about
			let g = ["CameraList", "TopMessage", "ButtonBar", "MainMenu", "CameraVersions"];
			for (let i = 0; i < g.length; i++) {
				if(!$("#"+g[i]).is(":hidden"))
				{
					$("#"+g[i]).stop();
					$("#"+g[i]).fadeTo( speed , val, function() {
						// Animation complete.
					});
				}
			}
		}

		let fade = false;
		function onDocumentMouseDown( event ) {
			//if (BlockDoubleTap()) return;
			event.preventDefault();

			fade = true;

			isUserInteracting = true;
			isUserDragging = false;

			AutoRotateOff();
			
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

			if (MeasureEnabled) InteractionDiv.style.cursor = "crosshair";
			else {
				if (InteractionDiv.style.cursor == "grab" || InteractionDiv.style.cursor == ""){
					InteractionDiv.style.cursor = "grabbing";
				}
			}
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
			let c = "grab";
			if (mapVisible) c = "crosshair";
			$("#NameBar").hide();
			
			
			if ( isUserInteracting === true ) {
				if (fade) {
					fade = false;
					FadeMenus(0.1);
				}
				
				c = "grabbing";
				/*
				if (Selected_INFO_OBJECT != undefined) {
					Selected_INFO_OBJECT.material.opacity = 0.000001;
					Selected_INFO_OBJECT.wire.material.color = new THREE.Color("rgb(20, 160, 230)");
					Selected_INFO_OBJECT.wire.material.opacity = 0.2;
					Selected_INFO_OBJECT = undefined;
				}*/
				
				// free the camera movement if map is visible
				if (!mapVisible) {
					lon = ( onPointerDownPointerX - mousePosX ) * 0.1 + onPointerDownLon;
					lat = ( mousePosY - onPointerDownPointerY ) * 0.1 + onPointerDownLat;
				}
			
			} else {
				
				if (!MeasureEnabled) {
				
					CheckForPOVIntersection(mouse);
					CheckForInfoBoxIntersection();
				
					if (INFO_OBJECT == null && INTERSECTED == null) {
						
						//if (!mapVisible) InteractionDiv.style.cursor = "grab";
						//document.getElementById("NameBar").innerHTML = "";//"</br>";
					} else {
						//if (!mapVisible) 
							c = "pointer";
					}
				}
				
			}
			
			isUserDragging = true;
			
			let bmx = mouse.x;
			let bmy = mouse.y;
			mouse.x = ( mousePosX / window.innerWidth ) * 2 - 1;
			mouse.y = - ( mousePosY / window.innerHeight ) * 2 + 1;
			// check that the mouse hasn't moved to enable click
			if (bmx-mouse.x == 0 && bmy-mouse.y == 0) { isUserDragging = false; }
			
			if (MeasureEnabled) InteractionDiv.style.cursor = "crosshair";
			else InteractionDiv.style.cursor = c;
			
		}

		function onDocumentMouseLeave( event ) {

			fade = false;
			FadeMenus(1);

			if (event != undefined){
				event.stopPropagation();
				event.preventDefault();
			}
			
			isUserInteracting = false;
			isUserDragging = false;
			
			if (INFO_OBJECT != null && INFO_OBJECT != Selected_INFO_OBJECT) {
				// remove previous hover edits from previous hover object
				INFO_OBJECT.material.opacity = 0.05;
				//INFO_OBJECT.material.opacity = 0.2;
				INFO_OBJECT.children[0].material.opacity = 0.2;
				//INFO_OBJECT.children[0].material.linewidth = 1;
			}
			INFO_OBJECT = null;
			
			
			//if (MeasureEnabled) InteractionDiv.style.cursor = "crosshair";
			//else InteractionDiv.style.cursor = "grab";
			
			$("#NameBar").hide();
		}

		function onDocumentMouseUp( event ) {

			if (event != undefined){
				event.stopPropagation();
				event.preventDefault();
			}

			isUserInteracting = false;

			FadeMenus(1);


			if (!isUserDragging) {
				if (MeasureEnabled) {
					CreateMeasurePoint();
				}
				else {
					CheckForPOVIntersection(mouse);
					CheckForInfoBoxIntersection();

					if (INTERSECTED != null) {
						ChangePOV(INTERSECTED.name);
						RefreshZoom();
					} else {
					if (INFO_OBJECT != null) {
						if (Selected_INFO_OBJECT != undefined) {
							Selected_INFO_OBJECT.material.opacity = 0.05;
							//Selected_INFO_OBJECT.wire.material.color = new THREE.Color("rgb(20, 160, 230)");
							Selected_INFO_OBJECT.wire.material.opacity = 0.2;
							Selected_INFO_OBJECT = undefined;
						}
						if (INFO_OBJECT != Selected_INFO_OBJECT){
							Selected_INFO_OBJECT = INFO_OBJECT;
							Selected_INFO_OBJECT.material.opacity = 0.1;
							//Selected_INFO_OBJECT.wire.material.color = new THREE.Color("rgb(80, 255, 160)");
							Selected_INFO_OBJECT.wire.material.opacity = 0.5;
							WriteAllData(Selected_INFO_OBJECT.info);
						}
					}
					}
				}
			}
			isUserDragging = false;
			
			if (MeasureEnabled) InteractionDiv.style.cursor = "crosshair";
			else InteractionDiv.style.cursor = "grab";
			
			$("#NameBar").hide();
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
			$("#ZoomText")[0].innerText = (ZoomValue/120);
			camera.updateProjectionMatrix();
			
			console.log(camera.fov);
		}

		// ================= Interaction End ===============


		// ================= Intersection Check End ===============


		function CheckForPOVIntersection(target){
			// called on onDocumentMouseMove
			//let vector = new THREE.Vector3( target.x, target.y, 1 );
			//projector.unprojectVector( vector, camera );
			//raycaster.set( camera.position, vector.sub( camera.position ).normalize() );
			raycaster.setFromCamera( target, camera );
			//let recursiveFlag;
			if (!POVsHidden) {
				let intersects = raycaster.intersectObjects( camangles_objs.children );
				//let intersects = raycaster.intersectObjects( objects, recursiveFlag );
				//let intersects = raycaster.intersectObjects( camangles.children );
				if (INTERSECTED != null) {
					//INTERSECTED.material.opacity = 0.8;
					if (INTERSECTED.spriteObj != undefined){ INTERSECTED.spriteObj.material.opacity = INTERSECTED.spriteObj.defaultOpacity; }
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

					let iconnames = INTERSECTED.CameraVersions.join("\n");

					ShowNameBar(iconnames); // INTERSECTED.name

					//console.log(INTERSECTED.CameraVersions);

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

			//let intersects = raycaster.intersectObjects( infoBoxes.children );
			let intersects = raycaster.intersectObjects( infoBoxes.children );

			if (INFO_OBJECT != null && INFO_OBJECT != Selected_INFO_OBJECT) {
				// remove previous hover edits from previous hover object
				INFO_OBJECT.material.opacity = 0.05;
				//INFO_OBJECT.material.opacity = 0.2;
				INFO_OBJECT.wire.material.opacity = 0.2;
				//INFO_OBJECT.children[0].material.linewidth = 1;
			}

			if ( intersects.length > 0 ) {
				//distance = Math.round(intersects[0].distance * 100) * 0.01;
				if ( INFO_OBJECT != intersects[0].object && intersects[0].object.visible ) {
					INFO_OBJECT = intersects[0].object;
				}
			} else {
				INFO_OBJECT = null;
			}

			if (INFO_OBJECT != null) {
				ShowNameBar(INFO_OBJECT.name);

				// An object has been intersected
				INFO_OBJECT.material.opacity = 0.1;
				INFO_OBJECT.wire.material.opacity = 0.5;
				//INFO_OBJECT.children[0].material.linewidth = 13;
				//console.log(INFO_OBJECT.children[0].material.linewidth);
				//WriteAllData(INFO_OBJECT.children[0]);//.children[0].visibile = true;
			}
			//================================================

		}

		// ================= Intersection Check End ===============




		// ================= Look Selection Start =================

		let POV_VectorAngles = [];
		function GetAllPOVAngles() {
			// get the angle from camera position
			// to the POV
			POV_VectorAngles = [];
			let oldRot = new THREE.Vector3( camera.rotation.x, camera.rotation.y, camera.rotation.z );
			for (let i=0; i < SceneData.CamPos.length; i++){
				if (SceneData.CamPos[chosenPOV].name == SceneData.CamPos[i].name) continue;
				let vector = new THREE.Vector3( SceneData.CamPos[i].x, 40, SceneData.CamPos[i].z );

				camera.lookAt( vector );

				vector = new THREE.Vector3( camera.rotation.x, camera.rotation.y, camera.rotation.z );
				while (vector.x < 0) vector.x = vector.x + (Math.PI * 2);
				while (vector.y < 0) vector.y = vector.y + (Math.PI * 2);
				while (vector.z < 0) vector.z = vector.z + (Math.PI * 2);

				POV_VectorAngles.push({name: SceneData.CamPos[i].name, vector: vector, index: i});
			}
			camera.rotation.set(oldRot);
		}

		let hoverTime = 0;
		let lasttime;
		let iv;
		let EnableSelectionTimer;
		let noSelect = true;
		function LookSelection() {
			// create the look selection timer if it doesn't exist
			if (EnableSelectionTimer == undefined){
				EnableSelectionTimer = setTimeout(function() {
					noSelect = false;
					//console.log("select on");
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

			/*
			return;

			let vector = new THREE.Vector3( camera.rotation.x, camera.rotation.y, camera.rotation.z );
			if (vector.x < 0) vector.x = vector.x + (Math.PI * 2);
			if (vector.y < 0) vector.y = vector.y + (Math.PI * 2);
			if (vector.z < 0) vector.z = vector.z + (Math.PI * 2);

			let max = 9999;
			let ind = -1;

			for (let i=0; i < POV_VectorAngles.length; i++){
				let cx = Math.abs(vector.x - POV_VectorAngles[i].vector.x);
				let cy = Math.abs(vector.y - POV_VectorAngles[i].vector.y);
				let cz = Math.abs(vector.z - POV_VectorAngles[i].vector.z);

				//if (POV_VectorAngles[i].name == "Camera 5") {
				//	console.log("Diff: " + cx, cy, cz + 
				//	"\nPOV: " + POV_VectorAngles[i].vector.x, POV_VectorAngles[i].vector.y, POV_VectorAngles[i].vector.z +
				//	"\nCam: " + vector.x, vector.y, vector.z);
				//}

				let feather = 0.04;
				let flip = (Math.PI*2)-feather;
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
				if (iv != undefined) { 
					clearInterval(iv); 
					//console.log("end the timer"); 
				}
				iv = undefined;
				hoverTime = 0;
				$("#CenterPointCirlce, #DoublePointCirlceLeft, #DoublePointCirlceRight").hide();
				ClearCircles();
			}
			*/
		}


		function ClearCircles() {
			let circles = ["CenterPointCirlce", "DoublePointCirlceRight", "DoublePointCirlceLeft"];
			for (i=0; i<circles.length; i++) {
				let c = document.getElementById( circles[i] );
				let ctx = c.getContext("2d");
				ctx.clearRect(0, 0, c.width, c.height);
			}
		}


		function drawSelectionArc() {
			let dt = new Date();

			if (lasttime == undefined) {
				lasttime = dt.getTime();
			}
			newtime = dt.getTime();
			let difftime = newtime - lasttime;
			lasttime = newtime;
			if (difftime == 0 || difftime > 1000) { return; }

			let seconds = 3;
			hoverTime += (difftime/(seconds*1000)) * (Math.PI*4);

			let circles = ["CenterPointCirlce", "DoublePointCirlceRight", "DoublePointCirlceLeft"];
			for (i=0; i<circles.length; i++) {
				let c = document.getElementById( circles[i] );
				let ctx = c.getContext("2d");
				ctx.clearRect(0, 0, c.width, c.height);
				ctx.lineWidth = 0.2 + (1.3 * hoverTime);
				ctx.strokeStyle = "rgba(255,255,255,0.7)";
				ctx.beginPath();
				ctx.arc(50, 50, 40, false, hoverTime);
				ctx.stroke();
			}
		}

		// ============= Look Selection End ================


		function DrawCross() { 
			// for testing purposes
			$("#cross").show();
			// Used to visually find the perfect center of the screen
			// draws to lines like an X so you can see the center
			let c=document.getElementById("cross");
			c.width = window.innerWidth/2;
			c.height = window.innerHeight;
			let ctx=c.getContext("2d");
			ctx.beginPath();
			ctx.moveTo(0,0);
			ctx.lineTo($(c).width(),$(c).height());
			ctx.stroke();

			ctx.beginPath();
			ctx.moveTo($(c).width(),0);
			ctx.lineTo(0,$(c).height());
			ctx.stroke();
		}


		function InchesToFeeet( inches ) {
			let feet = Math.floor(inches / 12);
			inches %= 12;
			inches = Math.round(inches*10) / 10
			return feet + "'-" + inches + '"';
		}


		function WordTexture(words, color, bg) {
		   let canvas1 = document.createElement('canvas');
		   let context1 = canvas1.getContext('2d');
		   context1.font = "Bold 400px Arial";
		   let wd = context1.measureText(words).width;
		   let ht = 400;
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
		   let texture1 = new THREE.Texture(canvas1);
		   //texture1.minFilter = texture1.magFilter = THREE.LinearFilter;
		   texture1.needsUpdate = true;
		   return [texture1, wd, ht];
		}


		function DrawSprite (words, sz, pos, color, bg) {
		   let textureresults = WordTexture(words, color, bg);
		   let texture1 = textureresults[0];
		   let wd = textureresults[1];
		   let ht = textureresults[2];

		   //let map = THREE.ImageUtils.loadTexture( "sprite.png" );
		   let material = new THREE.SpriteMaterial({ map: texture1, });
		   let object = new THREE.Sprite(material);
		   let width = material.map.image.width;
		   let height = material.map.image.height;
		   object.scale.set(sz, sz / width * height, 1);
		   object.position.set(pos[0], pos[1], pos[2]);
		   return object;
		   //scene.add(object);
		}


		function WriteAllData(object) {
			
			let write = "";//"Object Info:</br>";
			let keys = Object.keys(object);
			let k = "";
			keys.forEach(function(entry) {
				console.log(entry);
				if (entry == "name" || entry == "note" || (entry.endsWith("_link") && object[entry] != "")) {
					
					write += "<div class=\"objInfo_Block\"><p><span class=\"objInfo_Label\">" + entry;
					
					if (entry.endsWith("_link")) { // links
						//write += entry.replace("_link", "") + ": <a class=\"objInfo_Block\" target=\"_blank\"  href=\"" + object[entry] +  "\">Link</a></br>" ;
						write += ": <a class=\"objInfo_ValueLink\" target=\"_blank\"  href=\"" + object[entry] +  "\">" + object[entry] + "</a>" ;
					}
					else { write += ": </span><span class=\"objInfo_Value\">" + object[entry] +  "</span></p>" ; }
					
					write += "</div></br>";
				}
			});
			document.getElementById("ObjectInfoText").innerHTML = write;

			if (write == ""){//"Object Info:</br>"){
				CloseObjectInfo();
			}
			else {
				$("#ObjectInfo").stop().fadeTo( "fast" , 1, function() {
					// Animation complete.
				});
				$("#ObjectInfoArrow").stop().fadeTo( "fast" , 1, function() {
					// Animation complete.
				});
			}
		}



		function NameBarPosition() {
			let namebar = document.getElementById("NameBar");
			if (isAccel){
				namebar.style.left = window.innerWidth/2 - namebar.offsetWidth/2 + "px";
				namebar.style.top = "20%";
			} else {
				namebar.style.left = mousePosX - namebar.offsetWidth/2 + "px";
				namebar.style.top = mousePosY - namebar.offsetHeight - 30 + "px";
			}
		}


		function ShowNameBar(txt){
			let namebar = document.getElementById("NameBar");
			namebar.innerText = txt;
			if (!isStereo) $("#NameBar").show();
		}


		function ObjectCenterToScreenPos(object) {
			let pos = new THREE.Vector3();
			
			if (object != null) {
				
				pos = pos.setFromMatrixPosition(object.matrixWorld);
				//pos = object.getWorldPosition();

				pos.project(camera);
				
				let widthHalf = window.innerWidth / 2;
				let heightHalf = window.innerHeight / 2;

				pos.x = (pos.x * widthHalf) + widthHalf;
				pos.y = - (pos.y * heightHalf) + heightHalf;
				pos.z = 0;
			}
			return pos;
		}


		function ObjectInfoPosition() {
			if (Selected_INFO_OBJECT != null) {

				let ArrowLine = document.getElementById("ArrowLine");
				let ObjectInfo = document.getElementById("ObjectInfo");
				
				let pos1 = new THREE.Vector2(
					window.innerWidth - 600 - 81,
					81
					); // offsets based on the size of the info box
				
				let pos2 = ObjectCenterToScreenPos(Selected_INFO_OBJECT.infoPoint);
				
				//let pos2 = WorldToScreen(Selected_INFO_OBJECT.children[1]);
				/*if (pos2.x < 100 || pos2.x > window.innerWidth - (ObjectInfo.offsetWidth + 80)
				|| pos2.y < 100 || pos2.y > window.innerHeight - 100) {
					//Selected_INFO_OBJECT = undefined;
					CloseObjectInfo();
					return;
				}*/
				
				ArrowLine = document.getElementById("ArrowLine");
				ArrowLine.setAttribute("x1", pos1.x);
				ArrowLine.setAttribute("y1", pos1.y);
				
				pos2 = pos1.lerp(pos2, 0.95);
				
				ArrowLine.setAttribute("x2", pos2.x);
				ArrowLine.setAttribute("y2", pos2.y);
			}
		}


		function animate() {
			requestAnimationFrame( animate );
			update();
		}


		function update() {

			let delta = clock.getDelta();

			// START Click movement

			if (lerpFloat < 1) {
				lerpFloat += delta * 0.2;
			} else lerpFloat = 1;
			
			camera.position.lerp(PositionEnd, lerpFloat);

			CurrentDome.material.opacity = lerpFloat*10;
			OldDome.material.opacity = 1-(lerpFloat*4);
			
			if (CurrentDome.material.opacity > 1) CurrentDome.material.opacity = 1;
			if (CurrentDome.material.opacity < 0) CurrentDome.material.opacity = 0;
			if (OldDome.material.opacity > 1) OldDome.material.opacity = 1;
			if (OldDome.material.opacity < 0) OldDome.material.opacity = 0;

			// END Click movement


			autoRotateinc += delta * 0.005;
			if (autoRotateinc > autoRotatemax) autoRotateinc = autoRotatemax;
			if ( !disableAutoRotate ) {
				lon += autoRotateinc;
				//UpdateMap();
			}
			//getLocation(); // -------- FUTURE ADDITIONS

			NameBarPosition();
			ObjectInfoPosition();
			//LookSelection();
			
			if (isAccel) {
				controls.update();
				LookSelection();
			} 
			else {
				//document.getElementById("NameBar").innerText = lon;
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
			
			
			if (MeasureClick >= 1) {
				MoveMeasure();
			}
			
			/*
			// distortion
			camera.position.copy( camera.target ).negate();
			*/

			if (isStereo){ 
				effect.render( scene, camera ); 
			}
			else {
				renderer.render( scene, camera );
			}
			
			//ImageDome2.material.opacity -= 0.00001;

		}
		
		
		
		
		
		function CamPosLoaded(Module) {
			SceneData = new Module.SceneData;
			Init();
		}
		function CamPosLoaded2() {
			//console.log(SceneData);
			Init();
		}
		
		
		
		this.START = function() {

			// Get the project from the address bar
			let a = location.href;
			// replace all the %20 with spaces for nice name
			while (a.indexOf("%20") > -1) {
				a = a.replace("%20", " ")
			}
			// the project name is after the ?
			// there is a js file in that folder that
			// needs to be loaded
			let b = a.split("?");
			let script;
			if (b.length >= 3) {
				// 0 is the address
				DMGroup = b[1];
				DMProject = b[2];
				if (b.length > 3) {
					DefaultCamera = b[3];
				}
				let camposfile;

				// DomeProjectsDataList.js is read before this script
				// in dome.html. pl is created there
				for (let i=0; i<DomeProjectData.length; i++) {
					if (DMGroup == DomeProjectData[i].group && DMProject == DomeProjectData[i].project) {
						camposfile = DomeProjectData[i].dataFile;
						break;
					}
				}

				// load the campos.js file from the project
				//script = document.createElement('script');
				//script.type = 'text/javascript';
				//script.src = "https://space.wal-mart.com/3d/assets/uploads/" + camposfile + "?" + Math.floor(Math.random()*100000000);
				//let head = document.getElementsByTagName('head')[0];
				//head.appendChild(script);
				
				
				// load the campos.js file from the project
				//script = document.createElement('script');
				//script.type = 'module';
				//script.innerText = "\nimport { CamPos } from './assets/uploads/" + camposfile + "';";
				//let head = document.getElementsByTagName('head')[0];
				//head.appendChild(script);
				
				//let campossrc = "https://space.wal-mart.com/3d/assets/uploads/" + camposfile + "?" + Math.floor(Math.random()*100000000);
				//import(campossrc).then(function(m) {
				//  console.log(m);
				//});
				
				
				let camposfilepath = "https://space.wal-mart.com/3d/assets/uploads/" + camposfile;
				
				if (camposfilepath.indexOf('json') == -1) {
					const rr = import(camposfilepath);
					rr.then( function(result) { CamPosLoaded(result); } );
				} else {
					//let jsonfile = camposfilepath.replace(".js", ".json");
					readTextFile(camposfilepath, function(text){
						SceneData = JSON.parse(text);
						CamPosLoaded2();
					});
				}

				
				//const { concat } = await import('./namedConcat.js');
				//concat('b', 'c'); // => 'bc'
				
				
				//(async () => {
				//	const { default: CamPos, InfoBoxPos, TextReversed } = await import(pth);
				//})();
				
			} else { console.log("Invalid Data"); return; }

			

			// the images are svg, no loading necessary
			//PreloadButtonImages();

			//TEST
			//DrawCross();
			//$("#CenterDiv").show();
			//$("#DoublePointCirlceLeft, #DoublePointCirlceRight").show();

			if (a.indexOf("?")<=0) {return;}
			document.getElementById("TitleBarText").innerText = decodeURIComponent(DMProject);

			$("#ObjectInfo").hide();
			$("#ObjectInfoArrow").hide();
			//$("#ObjectInfo").show();

			if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)) {
				MobileOn();
			} else {
				$("#TopMessage").show();
				$("#StereoButton").hide();
				$("#AccelButton").hide();
			}
			lowRes = "lowRes/";

			// center of the screen for Look At Selection
			ScreenCenter.x = 0; 
			ScreenCenter.y = 0;


		}
	}
}



export { DomeScript };