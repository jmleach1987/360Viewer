import * as THREE from './build/three.module.js?v1.1';
import { DeviceOrientationControls } from './controls/DeviceOrientationControls.js?v1.1';
import { DomeProjectData } from '../../assets/uploads/Dome_Projects/DomeProjectsDataList.js?v1.1';
import { mobile } from './mobile.js?v1.1';
import { map } from './map.js?v1.1';

// import { CamPos } from '../../assets/uploads/Dome_Projects/4108/Baseline/CamPos.js';

class DomeScript {
	
	constructor( object ) {

		window.onerror = function(msg, url, line) {
			console.log("ERROR: " + msg + "\nurl: " + url + "\nline: " + line);
			let suppressErrorAlert = false;
			return suppressErrorAlert;
		}

		// when get request is made, alldata() is called
		// app.get('/elements', alldata);
		  
		//function alldata(request, response) {
			  
			// Returns all information about the elements
		//	response.send(elements);
		// }
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
		// }


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

		const clock = new THREE.Clock();

		const uploadsDir = 'https://space.wal-mart.com/3d/assets/uploads/Dome_Projects/';
		// ../../


		// let chosenPOV = 0; // index of the current camera
		let chosenCamObj;
		// loop through on first run to get the index
		// just in case the image loaded is not the first in the list

		// From the chosen camera
		// make the other points at an offset
		// camera will always be at 0,0,0
		// no longer using projector
		let controls, effect;
		
		// Dome movement
		const PositionStart = new THREE.Vector3().setScalar(-99999); // let PositionRig know that this is the first run
		const PositionEnd = new THREE.Vector3();
		let lerpFloat = 0;

		let mapVisible = false;
		let mapcard;
		const LastRot = new THREE.Vector2();

		const mouse = new THREE.Vector2();
		let cursor = "none"; // I change the cursor based on tools
		
		let onPointerDownPointerX;
		let onPointerDownPointerY;
		let onPointerDownLon;
		let onPointerDownLat;
		
		let ImageDome;
		let ImageDome2;
		
		const ScreenCenter = new THREE.Vector2();

		const InteractionDiv = document.getElementById( 'InteractionDiv' ); // this is the div with mouse interaction

		// let INTERSECTED;

		let INFO_OBJECT; // the hover info box
		let Selected_INFO_OBJECT; // the selected info box
		
		const infoBoxes = new THREE.Object3D(); // the collection of 3d info box objects
		infoBoxes.name = "infoBoxes";

		const camangles = new THREE.Object3D(); // the sprites and the selection geometry
		camangles.name = "camangles";
		
		let CamerasByDistance = []; // camera names sorted by distance from selected camera

		// for use with the buttons on off state
		let POVsHidden = false;
		let ZoomValue = 0;
		
		let isStereo = false, isMobile = false, isAccel = false;
		
		const FloorActors = {};

		//let locImage; // the location icon. load it once and reuse it

		let isUserInteracting = false, isUserDragging = false,
		onMouseDownMouseX = 0, onMouseDownMouseY = 0,
		lon = 0, onMouseDownLon = 0,
		lat = 0, onMouseDownLat = 0,
		phi = 0, theta = 0;

		let mousePosX = -1;
		let mousePosY = -1;

		const images = new Array();

		// let sparkSpriteMap;
		// let sparkSpriteMapAerial;

		let DefaultCamera;
		let CameraURL;

		let MeasureEnabled = false;

		let DMGroup;
		let DMProject;
		
		let SceneData;

		// ---
		
		let container, camera, scene, raycaster, renderer
		//
		// These will flip because I would prefer ImageDome to be first for no reason
		let CurrentDome;
		let OldDome;
		
		// --
		const floorArrow = new THREE.Object3D();
		const floorIconTex = {};
		floorIconTex["Arrow"] = new THREE.TextureLoader().load('src/img/FloorArrow.png');
		floorIconTex["None"] = new THREE.TextureLoader().load('src/img/FloorNone.png');
		floorIconTex["Position"] = new THREE.TextureLoader().load('src/img/FloorPosition.png');

		const multideck = new THREE.Object3D();
		
		let measureCollideVertical;
		
		// ============= Global Values End =====================



		function onWindowResize() {

			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();

			renderer.setSize( window.innerWidth, window.innerHeight );

			if (effect != undefined) effect.setSize( window.innerWidth, window.innerHeight );

			//DrawMap();
		}


		function Init() {
			// SceneData needs to be loaded before here
			// DefaultCamera should be loaded from HTML
			
			container = document.getElementById( 'container' );
			camera = new THREE.PerspectiveCamera( 65, window.innerWidth / window.innerHeight, 1, 100000 );
			camera.target = new THREE.Vector3(0,0,0);
			scene = new THREE.Scene();
			raycaster = new THREE.Raycaster();
			renderer = new THREE.WebGLRenderer({antialias: true });
			renderer.setSize( window.innerWidth, window.innerHeight );
			//renderer.gammaInput = true;
			//renderer.gammaOutput = true;
			container.appendChild( renderer.domElement );
			renderer.sortObjects = false; // controls depth sorting, but I'm still not sure how this works
			//renderer.outputEncoding = THREE.sRGBEncoding;



			const measureCollideVerticalgeometry = new THREE.PlaneGeometry( 500, 500 );
			const measureCollideVerticalmaterial = new THREE.MeshBasicMaterial({
				side: THREE.DoubleSide,
				wireframe: true,
				visible: false,
			});
			measureCollideVertical = new THREE.Mesh( measureCollideVerticalgeometry, measureCollideVerticalmaterial );
			scene.add( measureCollideVertical );
			
			// --
					
			const floorArrowgeometry = new THREE.PlaneGeometry( 30, 30 );
			const material = new THREE.MeshLambertMaterial({
				color: "rgb(0, 0, 0)",
				emissive: "rgb(255,255,255)",
				side: THREE.DoubleSide,
				map: floorIconTex["Arrow"],
				transparent: true,
				opacity: 0.6,
				//visible: true, // hides the object but it is still raycast-able
			});
			const floorArrowMesh = new THREE.Mesh( floorArrowgeometry, material );
			floorArrowMesh.rotation.x = Math.PI / 2;
			//floorArrowMesh.rotation.z = Math.PI;
			
			floorArrow.add(floorArrowMesh);
			scene.add( floorArrow );
			
			DrawDomes();
			
			DrawPOVs();			
			DrawInfoBoxes();
			MakeMultiDeck();
			
			// createCameraList();
			// MakeMapCamera();
			PreloadLowResTextures();
		}

		// ============= Start up End =====================

		function FloorHide() {
			if (chosenCamObj == undefined) return;
			camangles.children.forEach( function(child) {
				child.visible = (Math.abs(chosenCamObj.SceneData.floor - child.SceneData.floor) < 5);
			});
		}
		
		function DrawDomes() {
			const ImageDomeGeometry = new THREE.SphereGeometry( 50000, 60, 40 ); // radius, division height, division width
			const ImageDomeMaterial = new THREE.MeshBasicMaterial({
				side: THREE.DoubleSide,
				transparent: true,
				opacity: 0,
			});
			ImageDome = new THREE.Mesh( ImageDomeGeometry, ImageDomeMaterial );
			//ImageDomeGeometry.renderOrder = ImageDome.renderOrder = 1;
			ImageDomeMaterial.depthWrite = false;
			scene.add(ImageDome);
			//
			const ImageDome2Geometry = new THREE.SphereGeometry( 50000, 60, 40 ); // radius, division height, division width
			const ImageDome2Material = new THREE.MeshBasicMaterial({
				side: THREE.DoubleSide,
				transparent: true,
				opacity: 0,
			});
			ImageDome2 = new THREE.Mesh( ImageDome2Geometry, ImageDome2Material );
			//ImageDome2Geometry.renderOrder = ImageDome2.renderOrder = 2;
			ImageDome2Material.depthWrite = false;
			scene.add(ImageDome2);
			
			CurrentDome = ImageDome2;
			OldDome = ImageDome;
		}
		
		
		
		function MakeMultiDeck() {
			// the floor dimension is defined by the camera locations on that floor
			// so the cameras have to be created first
			Object.keys(FloorActors).forEach( function(h) {
				const planegeometry = new THREE.PlaneGeometry( 50010, 50010 );
				const planematerial = new THREE.MeshBasicMaterial({
					side: THREE.FrontSide,
					visible: false, // this is still raycast hitable
				});
				const multideckfloor = new THREE.Mesh( planegeometry, planematerial );
				multideckfloor.position.set(0,h,0);
				multideckfloor.rotation.x = -Math.PI / 2;
				multideck.add( multideckfloor );
				FloorActors[h].push(multideckfloor);
			});
			scene.add(multideck);
		}
		
		
		const VersionGroups = {};

		function DrawPOVs(){
			
			for (let i=0; i < SceneData.CamPos.length; i++){
				SceneData.CamPos[i].floor = parseFloat(SceneData.CamPos[i].floor);
				const cm = SceneData.CamPos[i];				
				const pos = new THREE.Vector3(cm.x, cm.y, cm.z);
				
				
				// Make the icon for the camera position object
				const CameraPositionGeometry = new THREE.PlaneGeometry( 30, 30 );
				const CameraPositionMaterial = new THREE.MeshLambertMaterial({
					color: "rgb(0, 0, 0)",
					emissive: "rgb(255,255,255)",
					side: THREE.DoubleSide,
					map: floorIconTex["Position"],
					transparent: true,
					opacity: 0.3,
					//visible: true, // hides the object but it is still raycast-able
				});
				const CameraPositionMesh = new THREE.Mesh( CameraPositionGeometry, CameraPositionMaterial );
				CameraPositionMesh.rotation.x = Math.PI / 2;
				CameraPositionMesh.SceneData = cm;
				
				CameraPositionMesh.position.set(pos.x, cm.floor+0.1, pos.z);
				
				CameraPositionMesh.castShadow = false;
				CameraPositionMesh.CamNum = i;
				
				let id = pos.x + "," + pos.y + "," + pos.z;
				if (VersionGroups[id] == undefined) { VersionGroups[id] = []; }
				VersionGroups[id].push(CameraPositionMesh);
				
				camangles.add(CameraPositionMesh);
				
				if (!(cm.floor in FloorActors)) {
					FloorActors[cm.floor] = [];
				}
				FloorActors[cm.floor].push(CameraPositionMesh);
				
			}
			scene.add(camangles);
			
			//
		}

		// ============= Camera position End =====================


		// ============= Image Loading Start =====================

		function PreloadLowResTextures() {

			if (DefaultCamera == undefined) DefaultCamera = 0;
			
			camangles.children.forEach( function(obj) {
				

				//if (SceneData.CamPos[i].name.indexOf("Map.jpg") != -1) continue;
				//let d = new Date();
				const src = uploadsDir + DMGroup + '/' + DMProject + '/lowRes/' + obj.CamNum + '.jpg';//?dummy=' + d.getTime();			

				// the camangles will be in the same order

				obj.DomeImage = new THREE.TextureLoader().load(src, function(tex) {
					
					tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
					tex.minFilter = THREE.LinearFilter;
					tex.generateMipmaps = false;
					tex.wrapS = THREE.RepeatWrapping;
					tex.repeat.x = -1.001; // -1 causes stretching bug
					
				});
				
				
			});
						
			// Having it in this timeout prevents a texture loading bug
			setTimeout(function(){ 
				ChangePOV(camangles.children[DefaultCamera]);
			}, 10);
			
			
			$("#LoadingWord")[0].innerText = "Complete";
			EndLoading();
			$("#Loading").fadeTo( "slow" , 0, function() {
				$("#Loading").hide();
				//$("#BGLoadingGrp").fadeIn();
			});
		}


		function EndLoading(){

			window.addEventListener( 'resize', onWindowResize, false );

			document.getElementById("MenuButton").addEventListener( 'click', OpenMainMenu, false );
			
			document.getElementById("StereoButton").addEventListener( 'click', mobile.StereoOn, false );
			document.getElementById("AccelButton").addEventListener( 'click', mobile.AccelOn, false );
			
			document.getElementById("MesW").addEventListener( 'click', MeasureWidth, false );
			document.getElementById("MesH").addEventListener( 'click', MeasureHeight, false );

			//document.getElementById("Button_HideCameraList").addEventListener( 'click', HideShowCameras, false );
			document.getElementById("Button_MapView").addEventListener( 'click', map.MapView, false );
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


		// ============= Camera position Start =====================


		function ChangePOV(camObj) {
			
			RefreshZoom();
			
			// if (camObj == undefined) { camObj = camangles.children[0]; chosenCamObj = camangles.children[0]; }
			if (chosenCamObj != undefined) chosenCamObj.visible = true;
			chosenCamObj = camObj;
			chosenCamObj.visible = false;

			mobile.EnableSelectionTimer = undefined;
			mobile.noSelect = true;
			mapVisible = false;
			
			CloseObjectInfo();

			// scene.remove(scene.children); // i dont know why i have this
			// $(".camListButtonsOn").attr('class', 'camListButtons');

			// for (let i=0; i < SceneData.CamPos.length; i++){
			//	chosenPOV = i;
			//	if (camObj == camangles.children[i]) break;
			// }
			
			// if (mapcard.visible) {
			//	lat = LastRot.x;
			//	lon = LastRot.y;
			//	camera.fov = 65;
			// }
			// mapcard.visible = false;
			

			// SceneData.CamPos[chosenPOV].button.className = "camListButtons camListButtonsOn";
			
			PositionRig();
			
			ShowHideInfoBoxesByCamera(camObj);
			ShowVersionCameraButtons(camObj);

			// mobile.GetAllPOVAngles();

			// SparkIconDepthOpacity();
			FloorHide();
						
			// Add the camera to the address
			// Get the project from the address bar
			let loc = location.href;
			let b = loc.split("?");
			if (b.length >= 3) {
				// while (camObj.indexOf(" ") > -1) {
				//	camObj = camObj.replace(" ", "%20")
				// }
				let newref = "";
				for (let i=0; i<3; i++) {
					if (newref != "") newref += "?";
					newref += b[i];
				}
				CameraURL = newref + "?" + camObj.CamNum;
			}
			
		}


		function PositionRig() {
			let pos = chosenCamObj.position;
			

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
			if (PositionStart.distanceTo( new THREE.Vector3().setScalar(-99999) ) == 0) {
				camera.position.copy( pos );
			}
			PositionStart.copy(camera.position);
			PositionEnd.copy(pos);
			
			
			CurrentDome.position.copy( pos );
			
			// Rotates the sphere to be at the correct world orientation
			if (SceneData.flip != undefined) {
				//console.log("Flipped");
				CurrentDome.rotation.y = THREE.Math.degToRad( -180 );
			} else {
				if (chosenCamObj.SceneData.ry == undefined){
					CurrentDome.rotation.y = THREE.Math.degToRad( 90 );
					//console.log("No Rotation");
				} else {
					CurrentDome.rotation.y = THREE.Math.degToRad( chosenCamObj.SceneData.ry+90 );
				}
			}
			
			CurrentDome.material.map = chosenCamObj.DomeImage;
			CurrentDome.material.needsUpdate = true;
			
			//console.log(PositionStart.distanceTo(PositionEnd));
			
			let sc = PositionStart.distanceTo(PositionEnd) / 50000.0;
			CurrentDome.scale.set(sc, sc, sc);
			OldDome.scale.set(sc, sc, sc);
			
			lerpFloat = 0;
			
			
			setTimeout(function(){ if( lerpFloat == 1 && CurrentDome.material.map.image != undefined)
			{
				let ff = String(CurrentDome.material.map.image.src);
				if (ff.includes("/lowRes/")) {
				
					let src = uploadsDir + DMGroup + '/' + DMProject + '/' + chosenCamObj.CamNum + '.jpg';
					
					chosenCamObj.DomeImage = new THREE.TextureLoader().load(src, function(tex) {
						tex.minFilter = THREE.LinearFilter;
						tex.generateMipmaps = false;
						tex.wrapS = THREE.RepeatWrapping;
						tex.repeat.x = - 1;
						
						// let texname = src.replace(uploadsDir + DMGroup + '/' + DMProject + '/', "").replace(".jpg", "");
						
					});
					CurrentDome.material.map = chosenCamObj.DomeImage;
					CurrentDome.material.needsUpdate = true;
				}
			} }, 10);
			
			
		}

		/*
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
					console.log("Crate");
					return false;
				};
				camlist.appendChild(nb);
			});
		}
		*/



















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
			//if (event != undefined)
			// {
			//	event.stopPropagation();
			//	event.preventDefault();
			// }
			//if (camangles == undefined) return;
			//camangles.children.forEach( function(child) {
			//	child.visible = POVsHidden;
			// });
			//camangles.children[chosenPOV].visible = false;
			//camangles.children.forEach( function(child) {
			//	child.visible = POVsHidden;
			//	if (child.name == SceneData.CamPos[chosenPOV].name) child.visible = false;
			// });
			
			//infoBoxes.children.forEach( function(child) {
			//	child.visible = POVsHidden;
			// });

			//POVsHidden = !POVsHidden;

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
			// }
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
			floorArrow.visible = !MeasureEnabled;
			
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


		function ShowVersionCameraButtons(camObj) {

			// remove all children
			const myNode = document.getElementById("CameraVersions");
			while (myNode.firstChild) {
				myNode.removeChild(myNode.lastChild);
			}
			
			
			let id = camObj.SceneData.x + "," + camObj.SceneData.y + "," + camObj.SceneData.z;
			if (VersionGroups[id].length <= 1) { return; }
			
			let i = 0;
			VersionGroups[id].forEach( function(obj) {
				if (obj != chosenCamObj) {
					let cvb = document.createElement('button');
					cvb.type = "button";
					cvb.className = "ButtonBarButton";
					cvb.textContent = i++;
					myNode.appendChild(cvb);
					
					cvb.addEventListener('click', function(){ ChangePOV(obj); }, false);
				}
			});
			
		}


		
		/*
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
			sprite.position.set(pos.x,pos.y,pos.z); // (height*sc)/2
			//sprite.renderOrder = 10;
			//scene.add(sprite);
			return sprite;
		}
		*/
		

		
		/*
		function SparkIconDepthOpacity() {
			return;
			if (camangles == undefined) return;
			
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
		*/



		

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
				let intersects = raycaster.intersectObjects( multideck.children );
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
				intersects = raycaster.intersectObjects( multideck.children );
			} else {
				// Vertical
				intersects = raycaster.intersectObjects( [measureCollideVertical] );
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
			
			measureCollideVertical.position.set( 
				MeasurePoints[0].position.x, 
				MeasurePoints[0].position.y, 
				MeasurePoints[0].position.z
				);
			let lk = camera.position.clone();
			lk.y = 0;
			measureCollideVertical.lookAt(lk);
			
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


		function CursorFloorPosition() {
			raycaster.setFromCamera( mouse, camera );
			let intersects = raycaster.intersectObjects( multideck.children );
			if ( intersects.length > 0 ) {
				let pt = new THREE.Vector3(intersects[0].point.x, 0, intersects[0].point.z);
				const d = camera.position.distanceTo( pt );
				return pt;
			}
			cursor = "default";
			return false;
		}

		function FloorIcon() {
			
			floorArrow.nearest = undefined;
			
			// Does the cursor point at the floor
			let floorposition = CursorFloorPosition();

			if (floorposition) { 
			
				floorArrow.position.copy(floorposition);
				// if the nearest point is more than a distance away
				// don't consider it near.
				// start with the nearest allowed distance
				let lowest = 1000;
				let nearest;
				camangles.children.forEach( function(child) {
					if(child != chosenCamObj) {
						let dist = floorArrow.position.distanceTo( child.position );
						child.material.opacity = clamp(1 - (dist * 0.01), 0.05, 0.6);
						if (dist < lowest) {
							lowest = dist;
							nearest = child;
						}
					}
				});
				console.log(nearest);
				if (nearest != undefined) {
					let nearestpos = new THREE.Vector3().copy(nearest.position);
					nearestpos.multiply(new THREE.Vector3(1,0,1));
					floorArrow.lookAt(nearestpos);
					floorArrow.nearest = nearest;
				} else {
					let f = new THREE.Vector3(chosenCamObj.position.x, chosenCamObj.position.y, chosenCamObj.SceneData.floor + 0.1 );
					// console.log(f);
					floorArrow.lookAt(f);
					
				}
				
			}
			
			if (floorArrow.nearest == undefined) {
				if (floorArrow.children[0].material.map != floorIconTex["None"]) {
					floorArrow.children[0].material.map = floorIconTex["None"];
					floorArrow.children[0].material.needsUpdate = true;
				}
			} else {
				if (floorArrow.children[0].material.map != floorIconTex["Arrow"]) {
					floorArrow.children[0].material.map = floorIconTex["Arrow"];
					floorArrow.children[0].material.needsUpdate = true;
				}
			}
			//floorArrow.children[0].visible = (floorArrow.nearest != undefined);

		}




		// ============= Info Boxes =====================

		function DrawInfoBoxes(){
			
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
				child.visible = (!child.camgroup.includes(CamPosName));
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
			
			cursor = "none";
			
			FloorIcon();
			
			if (mapVisible) cursor = "crosshair";
			$("#NameBar").hide();
			
			if ( isUserInteracting === true ) {
				if (fade) {
					fade = false;
					FadeMenus(0.1);
				}
				
				cursor = "grabbing";
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
					// CheckForPOVIntersection(mouse);
					CheckForInfoBoxIntersection();
				}
				
			}
			
			isUserDragging = true;
			
			let bmx = mouse.x;
			let bmy = mouse.y;
			mouse.x = ( mousePosX / window.innerWidth ) * 2 - 1;
			mouse.y = - ( mousePosY / window.innerHeight ) * 2 + 1;
			// check that the mouse hasn't moved to enable click
			if (bmx-mouse.x == 0 && bmy-mouse.y == 0) { isUserDragging = false; }
			
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
					//if (!CheckForPOVIntersection(mouse)) {
						if (!CheckForInfoBoxIntersection()) {
							if (floorArrow.nearest != undefined) {
								ChangePOV(floorArrow.nearest);
							}
						}
					// }

					//if (INTERSECTED != null) {
					//	ChangePOV(INTERSECTED);
					//	
					// } else {
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
					// }
					
					
				}
			}
			isUserDragging = false;
			
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

		/*
		function CheckForPOVIntersection(target){
			raycaster.setFromCamera( target, camera );
			//let recursiveFlag;
			if (!POVsHidden) {
				let intersects = raycaster.intersectObjects( camangles.children );
				if (INTERSECTED != null) {
					//if (INTERSECTED.spriteObj != undefined){ INTERSECTED.spriteObj.material.opacity = INTERSECTED.spriteObj.defaultOpacity; }
					//INTERSECTED.material.opacity = INTERSECTED.defaultOpacity;
				}

				if ( intersects.length > 0 ) {
					if ( INTERSECTED != intersects[0].object ) {
						INTERSECTED = intersects[0].object;
					}
				} else {
					INTERSECTED = null;
				}


				// does it hit a camera position
				if (INTERSECTED != null && isMobile == false) {

					// let iconnames = INTERSECTED.CameraVersions.join("\n");

					// ShowNameBar(iconnames); // INTERSECTED.name
					
					//if (INTERSECTED.spriteObj != undefined){ INTERSECTED.spriteObj.material.opacity = 1; }
					//INTERSECTED.material.opacity = 1;

					// return true;
				}

				return false;
			}
		}
		*/


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
				// ShowNameBar(INFO_OBJECT.name);

				// An object has been intersected
				INFO_OBJECT.material.opacity = 0.1;
				INFO_OBJECT.wire.material.opacity = 0.5;
				//INFO_OBJECT.children[0].material.linewidth = 13;
				//console.log(INFO_OBJECT.children[0].material.linewidth);
				//WriteAllData(INFO_OBJECT.children[0]);//.children[0].visibile = true;
				cursor = "pointer";
				return true;
			}
			
			return false;
		}

		// ================= Intersection Check End ===============




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

/*
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
*/

/*
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
*/

		function WriteAllData(object) {
			
			let write = "";//"Object Info:</br>";
			let keys = Object.keys(object);
			let k = "";
			keys.forEach(function(entry) {
				//console.log(entry);
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


		/*
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
		*/


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

		function clamp(num, min, max) {
			if (num < min) num = min;
			if (num > max) num = max;
			return num;
		}

		function BezierBlend(t)
		{
			return t * t * (3.0 - 2.0 * t);
		}


		function animate() {
			requestAnimationFrame( animate );
			update();
		}


		function update() {

			let delta = clock.getDelta();
			// CurrentDome.material.opacity = 1;
			// START Click movement
			
			
			const totalDistance = PositionStart.distanceTo( PositionEnd );
			if (totalDistance == 0) { lerpFloat = 1; CurrentDome.scale.set(1,1,1); }

			lerpFloat += delta * 1; // greater number is faster
			if (lerpFloat > 1) lerpFloat = 1;
			let diff = new THREE.Vector3().subVectors(PositionEnd, PositionStart);
			diff.multiplyScalar(BezierBlend(lerpFloat));
			diff.add(PositionStart);
			
			camera.position.copy(diff);
						
			
			const cameraDistance = camera.position.distanceTo( PositionEnd );
			let g = (totalDistance-cameraDistance) / totalDistance * 2;
			if (totalDistance == 0 || g > 1) g = 1;
			CurrentDome.material.opacity = g;
			OldDome.material.opacity = 1 - g;


			autoRotateinc += delta * 0.005;
			if (autoRotateinc > autoRotatemax) autoRotateinc = autoRotatemax;
			if ( !disableAutoRotate ) {
				lon += autoRotateinc;
				//UpdateMap();
			}
			//getLocation(); // -------- FUTURE ADDITIONS GPS coords

			// NameBarPosition();
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


			if (MeasureEnabled) cursor = "crosshair";
			InteractionDiv.style.cursor = cursor;
			
			
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
			Init();
		}
		
		
		
		this.START = function() {

			// Get the project from the address bar
			let a = location.href;
			// replace all the %20 with spaces for nice name
			while (a.includes("%20")) {
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
					DefaultCamera = parseInt(b[3]);
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

				
				let camposfilepath = "https://space.wal-mart.com/3d/assets/uploads/" + camposfile;
				
				if (!camposfilepath.includes('json')) {
					const rr = import(camposfilepath);
					rr.then( function(result) { CamPosLoaded(result); } );
				} else {
					//let jsonfile = camposfilepath.replace(".js", ".json");
					readTextFile(camposfilepath, function(text){
						SceneData = JSON.parse(text);
						CamPosLoaded2();
					});
				}

				
			} else { console.log("Invalid Data"); return; }

			
			// the images are svg, no loading necessary
			//PreloadButtonImages();

			//TEST
			//DrawCross();
			//$("#CenterDiv").show();
			//$("#DoublePointCirlceLeft, #DoublePointCirlceRight").show();

			if (!a.includes("?")) {return;}
			document.getElementById("TitleBarText").innerText = decodeURIComponent(DMProject);

			$("#ObjectInfo").hide();
			$("#ObjectInfoArrow").hide();

			if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)) {
				MobileOn();
			} else {
				$("#TopMessage").show();
				$("#StereoButton").hide();
				$("#AccelButton").hide();
			}

			// center of the screen for Look At Selection
			ScreenCenter.x = 0; 
			ScreenCenter.y = 0;


		}
	}
}



export { DomeScript };