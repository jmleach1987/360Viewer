import * as THREE from './src/js/build/three.module.js?v1.1';
import { DeviceOrientationControls } from './src/js/controls/DeviceOrientationControls.js?v1.1';
import { DomeProjectData } from './uploads/360Projects/DomeProjectsDataList.js?v1.1';
import { Mobile } from './src/js/mobile.js?v1.2';
import { userupdate } from './src/js/userupdate.js?v1.1';

import { DynamicFloor } from './src/js/DynamicFloor.js?v1.1';

class DomeScript {

    constructor(object) {

        // common error for messages
        window.onerror = function (msg, url, line) {
            console.log("ERROR: " + msg + "\nurl: " + url + "\nline: " + line);
            let suppressErrorAlert = false;
            return suppressErrorAlert;
        }

        // the test button function
        function Test() {
            //ImageDome.scale.subScalar(0.1, 0.1, 0.1);
            //ImageDome2.scale.subScalar(0.1, 0.1, 0.1);
        }

        // reads the data file created for camera positions etc
        function readTextFile(file, callback) {
            var rawFile = new XMLHttpRequest();
            rawFile.overrideMimeType("application/json");
            rawFile.open("GET", file, true);
            rawFile.onreadystatechange = function () {
                if (rawFile.readyState === 4 && rawFile.status == "200") {
                    callback(rawFile.responseText);
                }
            }
            rawFile.send(null);
        }


        // ============= Global Values Start =====================

        const clock = new THREE.Clock();

        // points to the website so the images can be literally sourced
        let uploadsDir = './src/uploads/';


        // this is the old way that was index based
        // let chosenPOV = 0; // index of the current camera
        // the selected camera to jump to
        let chosenCamObj;

        let controls, effect;

        // Dome movement
        const PositionStart = new THREE.Vector3().setScalar(-99999); // let PositionRig know that this is the first run
        const PositionEnd = new THREE.Vector3();
        // for lerping the position of one camera to another
        let lerpFloat = 0;

        const mouse = new THREE.Vector2();
        let cursor = "none"; // I change the cursor based on tools

        let onPointerDownPointerX;
        let onPointerDownPointerY;
        // these may show as unused but they are necessary
        let onPointerDownLon;
        let onPointerDownLat;

        let ImageDome;
        let ImageDome2;

        const ScreenCenter = new THREE.Vector2();

        const InteractionDiv = document.getElementById('InteractionDiv'); // this is the div with mouse interaction

        // let INTERSECTED;

        let INFO_OBJECT; // the hover info box
        let Selected_INFO_OBJECT; // the selected info box

        let PROD_OBJECT;

        const infoBoxes = new THREE.Object3D(); // the collection of 3d info box objects
        infoBoxes.name = "infoBoxes";

        const camangles = new THREE.Object3D(); // the sprites and the selection geometry
        camangles.name = "camangles";

        // for use with the buttons on off state
        let ZoomValue = 0;

        // const FloorActors = {};

        //let locImage; // the location icon. load it once and reuse it

        let isUserInteracting = false, isUserDragging = false,
            onMouseDownMouseX = 0, onMouseDownMouseY = 0,
            lon = 0, onMouseDownLon = 0,
            lat = 0, onMouseDownLat = 0,
            phi = 0, theta = 0;

        let mousePosX = -1;
        let mousePosY = -1;

        let DefaultCamera;
        let CameraURL;

        let MeasureEnabled = false;

        let DMGroup;
        let DMProject;

        let SceneData;

        let container, camera, scene, raycaster, renderer;
        //
        // These will flip because I would prefer ImageDome to be first for no reason
        let CurrentDome;
        let OldDome;

        const VersionGroups = {};
        const name_cam = {};
        let visInfoBoxes = [];
        let ProdPossObjs = [];
        let ProdPoss = [];
        let posID_ProdPos = {};
        let PosIDdist = 40;

        let floorlistopen = false;
        let cameralistopen = false;

        const loaded = []; // prevents the same texture loading twice
        const loadingQueue = []; // keeps the loading to a max number of textures

        let autoRotateinc = 0;
        let autoRotatemax = 0.03;
        let disableAutoRotate = false;
        let measureWidth = true;
        let contacttype;
        let MeasureObjs;
        let MeasurePoints = [];
        let MeasureClick = 0;
        let measuredist;
        let fade = false;
        let infoboxResizeDown = false;
        let infoboxResizeX;
        let infoboxResizeY;

        let CheckHiRes1;
        let CheckHiRes;
        let infoboxMoveBarDown = false;
        let infoboxMoveBarX;
        let infoboxMoveBarY;

        // --
        const floorArrow = new THREE.Object3D();
        floorArrow.name = "floorArrow";
        const floorIconTex = {};
        floorIconTex["Arrow"] = new THREE.TextureLoader().load('src/img/FloorArrow.png');
        floorIconTex["None"] = new THREE.TextureLoader().load('src/img/FloorNone.png');
        floorIconTex["Position"] = new THREE.TextureLoader().load('src/img/FloorPosition.png');
        floorIconTex["Up"] = new THREE.TextureLoader().load('src/img/FloorUpPosition.png');
        floorIconTex["Aerial"] = new THREE.TextureLoader().load('src/img/FloorAerialPosition.png');
        for (let i = 0; i < floorIconTex.length; i++) {
            floorIconTex[i].generateMipmaps = false;
            floorIconTex[i].anisotropy = renderer.capabilities.getMaxAnisotropy();
            floorIconTex[i].minFilter = THREE.LinearFilter;
        }

        const multideck = new THREE.Object3D();

        let measureCollideVertical;
        let measureCollideHorizontal;
        let measureCollideCurrent;


        // ============= Global Values End =====================



        function onWindowResize() {

            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();

            renderer.setSize(window.innerWidth, window.innerHeight);

            if (effect != undefined) effect.setSize(window.innerWidth, window.innerHeight);

            //DrawMap();
        }


        function Init() {
            // SceneData needs to be loaded before here
            // DefaultCamera should be loaded from HTML
            container = document.getElementById('container');

            camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 1, 100000);
            camera.target = new THREE.Vector3(0, 0, 0);

            scene = new THREE.Scene();
            scene.background = new THREE.Color("hsl(209, 16%, 50%)");
            //scene.add(camera);
            raycaster = new THREE.Raycaster();
            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            //renderer.gammaInput = true;
            //renderer.gammaOutput = true;
            container.appendChild(renderer.domElement);
            renderer.sortObjects = false; // controls depth sorting, but I'm still not sure how this works
            //renderer.outputEncoding = THREE.sRGBEncoding;


            const measureCollideGeometry = new THREE.PlaneGeometry(5000, 5000, 15, 15);
            const measureCollidematerial = new THREE.MeshBasicMaterial({
                side: THREE.DoubleSide,
                //wireframe: true,
                visible: false,
            });
            measureCollideHorizontal = new THREE.Mesh(measureCollideGeometry, measureCollidematerial);
            measureCollideHorizontal.name = "measureCollideHorizontal";
            //measureCollideHorizontal.visible = false;
            measureCollideHorizontal.rotation.x = Math.PI / 2;
            scene.add(measureCollideHorizontal);

            //const measureCollideVerticalgeometry = new THREE.PlaneGeometry(500, 500);
            measureCollideVertical = new THREE.Mesh(measureCollideGeometry, measureCollidematerial);
            measureCollideVertical.name = "measureCollideVertical";
            //measureCollideVertical.visible = false;
            scene.add(measureCollideVertical);

            DrawDomes();
            // --

            const floorArrowgeometry = new THREE.PlaneGeometry(30, 30);
            const material = new THREE.MeshLambertMaterial({
                color: "rgb(0, 0, 0)",
                emissive: "rgb(255,255,255)",
                side: THREE.DoubleSide,
                map: floorIconTex["Arrow"],
                transparent: true,
                opacity: 0.6,
                //visible: true, // hides the object but it is still raycast-able
            });
            const floorArrowMesh = new THREE.Mesh(floorArrowgeometry, material);
            floorArrowMesh.name = "floorArrowMesh";
            floorArrowMesh.position.set(0, -1, 0);
            floorArrowMesh.rotation.x = Math.PI / 2;
            //floorArrowMesh.rotation.z = Math.PI;
            floorArrow.add(floorArrowMesh);
            floorArrow.mesh = floorArrowMesh;

            scene.add(floorArrow);

            DrawPOVs();
            DrawInfoBoxes();
            AssignProdPositionsToPositionDict();

            CreateCameraList();

            PreloadLowResTextures();


            const campositions = [];
            SceneData.CamPos.forEach(function (camdata) {
                campositions.push({ "position": new THREE.Vector3(camdata.x, camdata.floor, camdata.z) });
            });


            const dynfloor = new DynamicFloor(
                scene,
                campositions,
                700, // merge
                5, // numpoints
                45 // buffer
            );
            // console.log(DynamicFloor);
            // console.log(dynfloor);

            const floor_meshes = dynfloor.floor_meshes; // dynfloor.clusterpoints(campositions, 90);
            for (let i = 0; i < floor_meshes.length; i++) {
                multideck.add(floor_meshes[i]);
            }
            scene.add(multideck);

        }


        // ============= Start up End =====================


        // ============================== ProdPositions


        function GetProdPosID(pos) {
            let posid = parseInt(Math.round(pos.x / PosIDdist) * PosIDdist) + "," + parseInt(Math.round(pos.y / PosIDdist) * PosIDdist) + "," + parseInt(Math.round(pos.z / PosIDdist) * PosIDdist);
            return posid;
        }


        function GetNearIndexes(pos) {
            let arrs = [];
            for (let x = -1; x < 2; x++) {
                for (let y = -1; y < 2; y++) {
                    for (let z = -1; z < 2; z++) {
                        const pos2 = pos.clone().add(new THREE.Vector3(x * PosIDdist, y * PosIDdist, z * PosIDdist));
                        const key = GetProdPosID(pos2);
                        if (posID_ProdPos[key] != undefined) {
                            arrs = arrs.concat(posID_ProdPos[key]);
                        }
                    }
                }
            }
            return arrs;
        }


        function AssignProdPositionsToPositionDict() {
            // this runs once to assign an index to their location
            // this is to remove the need to check every products
            // distance to camera every time the camera switches
            if (SceneData.ProdPositions == undefined) return;
            for (let i = 0; i < SceneData.ProdPositions.length; i++) {
                // SceneData.ProdPositions[i].UPC = parseInt(Math.random() * 10000);
                let pos = new THREE.Vector3(SceneData.ProdPositions[i].x, SceneData.ProdPositions[i].y, SceneData.ProdPositions[i].z);
                let PosID = GetProdPosID(pos);
                if (posID_ProdPos[PosID] == undefined) posID_ProdPos[PosID] = [];
                posID_ProdPos[PosID].push(SceneData.ProdPositions[i]);
            }
        }


        Array.prototype.equals = function (array) {
            // if the other array is a falsy value, return
            if (!array) return false;
            // compare lengths - can save a lot of time 
            if (this.length != array.length) return false;
            for (var i = 0, l = this.length; i < l; i++) {
                // Check if we have nested arrays
                if (this[i] instanceof Array && array[i] instanceof Array) {
                    // recurse into the nested arrays
                    if (!this[i].equals(array[i]))
                        return false;
                }
                else if (this[i] != array[i]) {
                    // Warning - two different object instances will never be equal: {x:20} != {x:20}
                    return false;
                }
            }
            return true;
        }


        function ShowProdPositions(camObj) {

            if (SceneData.ProdPositions == undefined) return;
            let newProdPos = GetNearIndexes(camObj.position);
            if (ProdPoss.equals(newProdPos)) { return; }
            ProdPoss = newProdPos;

            ProdPossObjs.forEach(function (child) {
                scene.remove(child);
            });
            ProdPossObjs = [];

            let c = new THREE.Color("rgb(255, 255, 255)");
            for (let i = 0; i < ProdPoss.length; i++) {

                const par = new THREE.Object3D();
                par.position.set(ProdPoss[i].x, ProdPoss[i].y, ProdPoss[i].z);
                par.rotation.y = -Math.PI / 2;

                const planegeometry = new THREE.PlaneGeometry(1, 1); // ProdPoss[i].width, ProdPoss[i].height );
                let material = new THREE.MeshBasicMaterial({
                    color: c,
                    //side: THREE.SingleSide,
                    transparent: true,
                    opacity: 0.01,
                    //opacity: 0.2,
                    visible: false
                });

                const planemesh = new THREE.Mesh(planegeometry, material);
                planemesh.position.set(0.5, 0.5, 0); // (ProdPoss[i].width * 0.393701) / 2.0, (ProdPoss[i].height * 0.393701) / 2.0, 0);

                planemesh.info = ProdPoss[i];

                par.scale.set(ProdPoss[i].width, ProdPoss[i].height, 1);

                const helper = new THREE.BoxHelper(planemesh, c);
                //helper.renderOrder = -1;
                helper.material.depthTest = false;
                helper.material.opacity = 0.2;
                helper.material.transparent = true;
                // helper.material.linewidth = 5; // this doesn't work

                planemesh.wire = helper;
                par.mesh = planemesh;


                par.add(helper);
                par.add(planemesh);
                scene.add(par);

                let infoPoint = new THREE.Object3D();
                infoPoint.name = "infoPoint";
                planemesh.infoPoint = infoPoint;
                infoPoint.position.set(0, 0, 0);
                planemesh.add(infoPoint);

                ProdPossObjs.push(par);
            }
        }


        // ==============================


        function DrawDomes() {
            const ImageDomeGeometry = new THREE.SphereGeometry(50000, 60, 40); // radius, division height, division width
            const ImageDomeMaterial = new THREE.MeshBasicMaterial({
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0,
            });
            ImageDome = new THREE.Mesh(ImageDomeGeometry, ImageDomeMaterial);
            //ImageDomeGeometry.renderOrder = ImageDome.renderOrder = 1;
            ImageDomeMaterial.depthWrite = false;
            scene.add(ImageDome);
            //
            const ImageDome2Geometry = new THREE.SphereGeometry(50000, 60, 40); // radius, division height, division width
            const ImageDome2Material = new THREE.MeshBasicMaterial({
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0,
            });
            ImageDome2 = new THREE.Mesh(ImageDome2Geometry, ImageDome2Material);
            //ImageDome2Geometry.renderOrder = ImageDome2.renderOrder = 2;
            ImageDome2Material.depthWrite = false;
            scene.add(ImageDome2);

            CurrentDome = ImageDome2;
            OldDome = ImageDome;
        }


        // ---


        function CreateCameraList() {
            let cameralist = document.getElementById("CameraList");

            // sort the names
            let nms = [];
            SceneData.CamPos.forEach(function (camdata) {
                nms.push(camdata.name);
            });
            nms = nms.sort(function (a, b) {
                return a.localeCompare(b, undefined, {
                    numeric: true,
                    sensitivity: 'base'
                });
            });

            nms.forEach(function (nm) {
                if (!nm.replace("_", "").toLowerCase().startsWith("domeviewer")) {
                    let nb = document.createElement("button");
                    //let nm = n[i];
                    //if (i>2) nm = "th";
                    //nm = i+1 + nm + " Floor"; i--;
                    nb.innerText = nm.replace(/_/g, " ");
                    nb.alt = nm;
                    nb.className = "FloorListButtons";
                    nb.onclick = nb.ontouchstart = function () {
                        ChangePOV(name_cam[nm]);
                    };
                    cameralist.appendChild(nb);
                }
            });
        }


        function DrawPOVs() {

            for (let i = 0; i < SceneData.CamPos.length; i++) {

                SceneData.CamPos[i].floor = parseFloat(SceneData.CamPos[i].floor);
                const cm = SceneData.CamPos[i];
                const pos = new THREE.Vector3(cm.x, cm.y, cm.z);

                // Make the icon for the camera position object
                const CameraPositionGeometry = new THREE.PlaneGeometry(30, 30);
                const CameraPositionMaterial = new THREE.MeshLambertMaterial({
                    color: "rgb(0, 0, 0)",
                    emissive: "rgb(255,255,255)",
                    side: THREE.DoubleSide,
                    map: floorIconTex["Position"],
                    transparent: true,
                    opacity: 0.05,
                    //visible: true, // hides the object but it is still raycast-able
                });
                if (pos.y - cm.floor > 65) { CameraPositionMaterial.map = floorIconTex["Up"]; }
                if (pos.y - cm.floor > 180) { CameraPositionMaterial.map = floorIconTex["Aerial"]; }
                const CameraPositionMesh = new THREE.Mesh(CameraPositionGeometry, CameraPositionMaterial);
                CameraPositionMesh.rotation.x = Math.PI / 2;
                CameraPositionMesh.SceneData = cm;
                CameraPositionMesh.name = cm.name;
                name_cam[cm.name] = CameraPositionMesh;

                CameraPositionMesh.position.set(pos.x, cm.floor + 0.1, pos.z);

                CameraPositionMesh.castShadow = false;
                CameraPositionMesh.CamNum = i;
                CameraPositionMesh.infoboxes = [];

                let id = GetVersionGroupID(pos);
                if (VersionGroups[id] == undefined) { VersionGroups[id] = []; }
                VersionGroups[id].push(CameraPositionMesh);

                camangles.add(CameraPositionMesh);

            }

            scene.add(camangles);

            //
        }


        function GetVersionGroupID(pos) {
            // make cameras with simalar heights versions also
            //let averageHeight = parseInt(Math.floor(pos.y / 280.0) * 280);
            return Math.round(pos.x) + "," + Math.round(pos.y) + "," + Math.round(pos.z);
        }


        // ============= Camera position End =====================



        // ============= Info Boxes =====================


        function DrawInfoBoxes() {

            if (SceneData.InfoBoxPos == undefined) return;
            for (let i = 0; i < SceneData.InfoBoxPos.length; i++) {

                let cm = SceneData.InfoBoxPos[i];

                let material = new THREE.MeshBasicMaterial({
                    color: cm.color,
                    //side: THREE.SingleSide,
                    transparent: true,
                    opacity: 0.05,
                    //opacity: 0.2,
                    visible: true
                });

                let pos = new THREE.Vector3(
                    cm.x,// - cm.wx/2, 
                    cm.y,// + cm.hy/2, 
                    cm.z,// + cm.dz/2
                );

                let rot = new THREE.Vector3(
                    THREE.Math.degToRad(cm.rx),
                    -THREE.Math.degToRad(cm.ry),
                    THREE.Math.degToRad(cm.rz)
                );


                let piv = new THREE.Vector3(cm.pivx, cm.pivy, cm.pivz);

                let mesh = new THREE.BoxGeometry(cm.wx - 1, cm.hy - 1, cm.dz - 1);
                let mesh2 = new THREE.BoxGeometry(cm.wx, cm.hy, cm.dz);

                let cube = new THREE.Mesh(mesh, material);
                let cube2 = new THREE.Mesh(mesh2, material);

                let infoPoint = new THREE.Object3D();
                infoPoint.name = "infoPoint";
                cube.infoPoint = infoPoint;

                let wire = new THREE.BoxHelper(cube2, new THREE.Color(cm.color));
                wire.material.transparent = true;
                wire.material.opacity = 0.2;
                wire.renderOrder = 1;

                cube.add(wire);
                cube.wire = wire;
                cube.name = cm.name;
                cube.info = cm;
                cube.position.set(pos.x, pos.y, pos.z);
                cube.rotation.set(rot.x, rot.y, rot.z);

                cube.camgroup = [];
                cm.cameras.split(",").forEach(function (s) {
                    cube.camgroup.push(name_cam[s]);
                });

                infoBoxes.add(cube);

                infoPoint.position.set(piv.x, piv.y, piv.z);
                cube.attach(infoPoint);
                //cube.renderOrder = 10;

                //for(let i=0; i < visInfoBoxes.length; i++) {
                let sprite = DrawSprite(5, 'src/img/infoIcon.png');
                infoPoint.add(sprite);
                sprite.position.set(0, 0, 0);
                //sprite.renderOrder = 5;
                // }

                /*
                // visible pivot point
                let materialTEST = new THREE.MeshBasicMaterial({
                color: cm.color,
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



        function ShowHideInfoBoxesByCamera(CamObj) {
            visInfoBoxes = [];
            infoBoxes.children.forEach(function (infobox) {
                let g = infobox.camgroup.includes(CamObj);
                infobox.visible = g;
                visInfoBoxes.push(infobox);
            });
        }


        // ============= Info Boxes =====================



        // ============= Image Loading Start =====================


        function PreloadATexture(obj) {

            let id = GetVersionGroupID(new THREE.Vector3(chosenCamObj.SceneData.x, chosenCamObj.SceneData.y, chosenCamObj.SceneData.z));
            if (!VersionGroups[id].includes(obj) && chosenCamObj != obj && loadingQueue.length > 2) return;

            if (loaded.includes(obj.name)) return;
            loaded.push(obj.name);

            loadingQueue.push(obj.name);
            if (obj.DomeImage != undefined) {
                if (chosenCamObj == obj) { ChangePOV(obj); }
                return;
            }
            obj.DomeImage = "loading";
            //if (loading.includes(obj)) {
            //	if(chosenCamObj == obj) ChangePOVTextureLoaded(obj);
            //	return;
            // };
            //loading.push(obj);

            // console.log("preload:" + obj.name);
            // let d = new Date();
            const src = uploadsDir + DMGroup + '/' + DMProject + '/lowRes/' + obj.name + '.jpg?v=' + SceneData.CacheTime;
            //console.log(src);			

            // the camangles will be in the same order

            obj.DomeImage = new THREE.TextureLoader().load(src, function (tex) {
                tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
                tex.minFilter = THREE.LinearFilter;
                tex.generateMipmaps = false;
                tex.wrapS = THREE.RepeatWrapping;
                tex.repeat.x = -1.001; // -1 causes stretching bug

                loadingQueue.splice(loadingQueue.indexOf(obj.name), 1);

                // if(chosenCamObj == obj) ChangePOVTextureLoaded(obj);
                if ($("#LoadingWord")[0].innerText != "Complete") {
                    $("#LoadingWord")[0].innerText = "Complete";
                    AddEvents();
                    $("#Loading").fadeTo("slow", 0, function () {
                        $("#Loading").hide();
                    });
                }
            });
        }

        function PreloadLowResTextures() {

            if (DefaultCamera == undefined) DefaultCamera = 0;
            ChangePOV(camangles.children[DefaultCamera]);

            //camangles.children.forEach( function(child) 
            //{
            //let nums = camangles.children.length;
            //const intv = setInterval( function() {
            //	PreloadATexture(camangles.children[camangles.children.length-nums]);
            //	nums-=1;
            //	if (nums < 0) clearInterval(intv);				
            //	}, 10000);
            // });

        }


        function AddEvents() {

            window.addEventListener('resize', onWindowResize, false);

            document.getElementById("MenuButton").addEventListener('click', OpenMainMenu, false);

            //document.getElementById("StereoButton").addEventListener('click', StereoOn, false);
            document.getElementById("AccelButton").addEventListener('click', AccelOn, false);

            document.getElementById("MesW").addEventListener('click', MeasureWidth, false);
            document.getElementById("MesH").addEventListener('click', MeasureHeight, false);

            document.getElementById("Button_CameraList").addEventListener('click', HideShowCameras, false);
            document.getElementById("Button_FloorList").addEventListener('click', HideShowLevels, false);
            // document.getElementById("Button_MapView").addEventListener( 'click', map.MapView, false );
            document.getElementById("Button_AutoRotateToggle").addEventListener('click', AutoRotateToggle, false);
            document.getElementById("Button_RefreshZoom").addEventListener('click', RefreshZoom, false);
            document.getElementById("Button_EmailLink").addEventListener('click', EmailLink, false);
            document.getElementById("Button_HideShowImage").addEventListener('click', HideShowImage, false);
            document.getElementById("Button_HideShowPOVs").addEventListener('click', HideShowPOVs, false);
            document.getElementById("Button_ToggleMeasureTool").addEventListener('click', ToggleMeasureTool, false);
            document.getElementById("CloseMeasureTool").addEventListener('click', ToggleMeasureTool, false);
            document.getElementById("Button_OpenReportContact").addEventListener('click', OpenReportContact, false);

            document.getElementById("ObjectInfo_CloseButton").addEventListener('click', CloseObjectInfo, false);

            document.getElementById("ObjectInfo").addEventListener('mousemove', ObjectInfoMoveBarMove, false); //document
            document.getElementById("ObjectInfoMoveBar").addEventListener('mousedown', ObjectInfoMoveBarDown, false);
            document.getElementById("ObjectInfoBottomResize").addEventListener('mousedown', ObjectInfoResizeDown, false);
            document.getElementById("ObjectInfo").addEventListener('mouseup', ObjectInfoMoveBarUp, false); //



            document.getElementById("ContactReportButton_CANCEL").addEventListener('click', CancelReportContact, false);
            document.getElementById("ContactReportButton_OK").addEventListener('click', ReportContact, false);
            document.getElementById("ContactReportButton_CLOSE").addEventListener('click', CancelReportContact, false);

            document.getElementById("ContactReportForm").addEventListener('change', ContactReport_Changed, false);

            InteractionDiv.addEventListener('mousedown', onDocumentMouseDown, false);
            InteractionDiv.addEventListener('mousemove', onDocumentMouseMove, false); //document
            InteractionDiv.addEventListener('mouseleave', onDocumentMouseLeave, false); //document
            InteractionDiv.addEventListener('mouseup', onDocumentMouseUp, false); //
            InteractionDiv.addEventListener('mousewheel', onDocumentMouseWheel, false);
            InteractionDiv.addEventListener('DOMMouseScroll', onDocumentMouseWheel, false);

            // document.getElementById("Test").addEventListener("click", function () { Test(); });

            InteractionDiv.addEventListener('touchstart', onDocumentMouseDown, false);
            InteractionDiv.addEventListener('touchmove', onDocumentMouseMove, false); //
            InteractionDiv.addEventListener('touchend', onDocumentMouseUp, false);


            animate();
        }

        // ============= Image Loading End =====================



        // ============= Button Operations Start =====================


        function ObjectInfoMoveBarDown(event) {
            event.preventDefault();
            infoboxMoveBarDown = true;
        }

        function ObjectInfoMoveBarMove(event) {
            event.preventDefault();

            if (event.targetTouches != undefined && event.targetTouches.length > 0) {
                mousePosX = event.targetTouches[0].clientX;
                mousePosY = event.targetTouches[0].clientY;
            }
            else {
                mousePosX = event.clientX;
                mousePosY = event.clientY;
            }
        }

        function ObjectInfoMoveBarUp(event) { event.preventDefault(); infoboxMoveBarDown = false; infoboxResizeDown = false; }


        // RESIZE


        function ObjectInfoResizeDown(event) {
            event.preventDefault();
            infoboxResizeDown = true;
            document.getElementById("ObjectInfo").style.left = document.getElementById("ObjectInfo").offsetLeft + "px";
            document.getElementById("ObjectInfo").style.right = "auto";
        }


        // ============= Camera position Start =====================


        function ChangePOV(camObj) {

            if (chosenCamObj != undefined) chosenCamObj.visible = true;
            chosenCamObj = camObj;
            chosenCamObj.visible = false;

            // PreloadATexture(camObj);

            let id = GetVersionGroupID(new THREE.Vector3(chosenCamObj.SceneData.x, chosenCamObj.SceneData.y, chosenCamObj.SceneData.z));
            VersionGroups[id].forEach(function (ch) {
                PreloadATexture(ch);
            });

            RefreshZoom();

            // if (camObj == undefined) { camObj = camangles.children[0]; chosenCamObj = camangles.children[0]; }

            Mobile.EnableSelectionTimer = undefined;
            Mobile.noSelect = true;

            CloseObjectInfo();

            // scene.remove(scene.children); // i dont know why i have this
            $(".FloorListButtonsOn").attr('class', 'FloorListButtons');

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


            // SceneData.CamPos[chosenPOV].button.className = "floorlistButtons floorlistButtonsOn";

            PositionRig();

            ShowHideInfoBoxesByCamera(camObj);
            ShowVersionCameraButtons(camObj);
            ShowProdPositions(camObj);

            // mobile.GetAllPOVAngles();

            // SparkIconDepthOpacity();

            // Add the camera to the address
            // Get the project from the address bar
            let loc = location.href;
            let b = loc.split("?");
            if (b.length >= 3) {
                // while (camObj.indexOf(" ") > -1) {
                //	camObj = camObj.replace(" ", "%20")
                // }
                let newref = "";
                for (let i = 0; i < 3; i++) {
                    if (newref != "") newref += "?";
                    newref += b[i];
                }
                CameraURL = newref + "?" + camObj.CamNum;
            }

        }

        function PositionRig() {

            let pos = new THREE.Vector3(chosenCamObj.SceneData.x, chosenCamObj.SceneData.y, chosenCamObj.SceneData.z);

            if (CurrentDome == ImageDome) {
                CurrentDome = ImageDome2;
                OldDome = ImageDome;
            }
            else {
                CurrentDome = ImageDome;
                OldDome = ImageDome2;
            }

            // is this the first position
            if (PositionStart.distanceTo(new THREE.Vector3().setScalar(-99999)) == 0) {
                camera.position.copy(pos);
            }
            PositionStart.copy(camera.position);
            PositionEnd.copy(pos);

            CurrentDome.position.copy(pos);

            // Rotates the sphere to be at the correct world orientation
            if (SceneData.flip != undefined) {
                //console.log("Flipped");
                CurrentDome.rotation.y = THREE.Math.degToRad(-180);
            } else {
                if (chosenCamObj.SceneData.ry == undefined) {
                    CurrentDome.rotation.y = THREE.Math.degToRad(90);
                    //console.log("No Rotation");
                } else {
                    CurrentDome.rotation.y = THREE.Math.degToRad(chosenCamObj.SceneData.ry + 90);
                }
            }

            CurrentDome.material.map = chosenCamObj.DomeImage;
            CurrentDome.material.needsUpdate = true;

            //console.log(PositionStart.distanceTo(PositionEnd));

            let sc = PositionStart.distanceTo(PositionEnd) / 50000.0;
            CurrentDome.scale.set(sc, sc, sc);
            OldDome.scale.set(sc, sc, sc);

            lerpFloat = 0;

            // if there is a previous interval that never finished, kill it
            if (CheckHiRes1 != undefined) clearTimeout(CheckHiRes1);

            // continue to check the material until the lowres material has loaded
            CheckHiRes1 = setInterval(function () {
                // check for lerpfloat because I don't want the hiRes
                // loading at the same time as the lowres
                // this slows the loading of the lowres resulting in
                // the dreaded black screen - no image loaded
                if (lerpFloat == 1 && CurrentDome.material.map.image != undefined && CurrentDome.material.map.image.src != undefined) {

                    // make sure the user is not traveling to load hires images
                    // only load it when the user is stationary
                    // each time they move forward the interval is killed
                    if (CheckHiRes != undefined) clearTimeout(CheckHiRes);
                    CheckHiRes = setTimeout(function () {

                        if (CurrentDome == undefined) { console.log("a"); return; }
                        if (CurrentDome.material == undefined) { console.log("b"); return; }
                        if (CurrentDome.material.map == undefined) { console.log("c"); return; }
                        if (CurrentDome.material.map.image == undefined) { console.log("d"); return; }
                        if (CurrentDome.material.map.image.src == undefined) { console.log("e"); return; }

                        let ff = String(CurrentDome.material.map.image.src);
                        if (ff.includes("/lowRes/")) {
                            // let d = new Date();
                            let src = uploadsDir + DMGroup + '/' + DMProject + '/' + chosenCamObj.name + '.jpg?v=' + SceneData.CacheTime; // + d.getTime();
                            console.log("loading Highres: " + src);
                            chosenCamObj.DomeImage = new THREE.TextureLoader().load(src, function (tex) {
                                tex.minFilter = THREE.LinearFilter;
                                tex.generateMipmaps = false;
                                tex.wrapS = THREE.RepeatWrapping;
                                tex.repeat.x = -1;

                                // let texname = src.replace(uploadsDir + DMGroup + '/' + DMProject + '/', "").replace(".jpg", "");

                                CurrentDome.material.map = chosenCamObj.DomeImage;
                                CurrentDome.material.needsUpdate = true;
                                console.log("Highres Loaded, Switching: " + chosenCamObj.name);
                            });
                        }
                    }, 4000);

                    clearInterval(CheckHiRes1);
                } else {
                    //console.log("nope");
                }
            }, 500); // checks every ? milliseconds until loaded


        }

        function RefreshZoom(event) {
            //if (BlockDoubleTap()) return;
            if (event != undefined) {
                event.stopPropagation();
                event.preventDefault();
            }

            camera.fov = 65;
            ZoomValue = 0;
            $("#ZoomText")[0].innerText = "0";
            camera.updateProjectionMatrix();
        }

        function CloseObjectInfo(event) {
            if (event != undefined) {
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

        function OpenMainMenu(event) {
            if (event != undefined) {
                event.stopPropagation();
                event.preventDefault();
            }

            $("#MainMenu").children().hide();
            $("#MainMenu").css("overflowY", "hidden")
                .stop()
                .slideToggle("fast", function () {
                    $("#MainMenu").children().fadeIn();
                    $("#MainMenu").css("overflowY", "auto");
                });
            /*
            if (Object.keys(FloorActors).length <= 1)
            {
                $("#Button_FloorList").hide();
                $("#Button_FloorList").children().hide();
            }*/
        }

        function HideShowImage(event) {
            //if (BlockDoubleTap()) return;
            if (event != undefined) {
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

        function HideShowLevels(event) {
            if (event != undefined) {
                event.stopPropagation();
                event.preventDefault();
            }
            if (cameralistopen) HideShowCameras();

            if (!floorlistopen) {
                $("#FloorList").children().hide();
                $("#FloorList")
                    .css("overflow", "hidden")
                    .stop()
                    .show()
                    .animate({ width: "160px" }, "fast", "swing", function () {
                        $("#FloorList").children().fadeIn();
                        $("#FloorList").css("overflow", "auto");
                    });
            } else {
                $("#FloorList").children().hide();
                $("#FloorList")
                    .css("overflow", "hidden")
                    .stop()
                    .animate({ width: "0px" }, "fast", "swing", function () {
                        $("#FloorList").hide();
                    });
            }

            floorlistopen = !floorlistopen;
        }
        // ---
        function HideShowCameras(event) {
            if (event != undefined) {
                event.stopPropagation();
                event.preventDefault();
            }
            if (floorlistopen) HideShowLevels();

            if (!cameralistopen) {
                $("#CameraList").children().hide();
                $("#CameraList")
                    .css("overflow", "hidden")
                    .stop()
                    .show()
                    .animate({ width: "280px" }, "fast", "swing", function () {
                        $("#CameraList").children().fadeIn();
                        $("#CameraList").css("overflow", "auto");
                    });
            } else {
                $("#CameraList").children().hide();
                $("#CameraList")
                    .css("overflow", "hidden")
                    .stop()
                    .animate({ width: "0px" }, "fast", "swing", function () {
                        $("#CameraList").hide();
                    });
            }

            cameralistopen = !cameralistopen;
        }


        // --------- Auto Rotate -----------


        function AutoRotateToggle(event) {
            if (event != undefined) {
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
            if (event != undefined) {
                event.stopPropagation();
                event.preventDefault();
            }
            disableAutoRotate = true;
            autoRotateinc = 0;
            //let g = document.getElementById("AutoRotateButton");
            //g.className = g.className.replace("_On", "_Off");
        }


        // --------- Measure -----------


        function ToggleMeasureTool(event) {
            if (event != undefined) {
                event.stopPropagation();
                event.preventDefault();
            }
            MeasureEnabled = !MeasureEnabled;
            $("#MeasureText").fadeToggle("fast");
            if (MeasureObjs != undefined) { MeasureObjs.visible = MeasureEnabled; }
            HideShowPOVs();
            floorArrow.visible = !MeasureEnabled;
            multideck.visible = !MeasureEnabled;

            measureCollideCurrent = measureCollideHorizontal;
            //measureCollideHorizontal.visible = true;
            //measureCollideVertical.visible = false;
            measureCollideHorizontal.position.copy(chosenCamObj.position);

            $("#MeasureMenu").stop().fadeToggle("fast", function () { });
        }

        function MeasureWidth(event) {
            if (event != undefined) {
                event.stopPropagation();
                event.preventDefault();
            }
            measureWidth = true;
            measureCollideCurrent = measureCollideHorizontal;
            //measureCollideHorizontal.visible = true;
            //measureCollideVertical.visible = false;
            document.getElementById("MesH").className = "MainMenuButton";
            document.getElementById("MesW").className = "MainMenuButton MeasureOn";
        }
        function MeasureHeight(event) {
            if (event != undefined) {
                event.stopPropagation();
                event.preventDefault();
            }
            measureWidth = false;
            measureCollideCurrent = measureCollideVertical;
            measureCollideVertical.visible = true;
            measureCollideHorizontal.visible = false;
            document.getElementById("MesW").className = "MainMenuButton";
            document.getElementById("MesH").className = "MainMenuButton MeasureOn";
            // console.log("CHANGED");
        }

        function EmailLink(event) {
            if (event != undefined) {
                event.stopPropagation();
                event.preventDefault();
            }
            let subject = "3D Dome Viewer: " + DMGroup + " - " + DMProject;
            let body = "Here is the " + DMGroup + " - " + DMProject + " 3D Dome Viewer project for your review:\r\n\r\n<";
            body += CameraURL; //window.location.href;
            body += ">";

            let uri = "mailto:?subject=";
            uri += encodeURIComponent(subject);
            uri += "&body=";
            uri += encodeURIComponent(body);
            window.open(uri, '_self');
        }

        function OpenReportContact(event) {
            if (event != undefined) {
                event.stopPropagation();
                event.preventDefault();
            }
            $("#ContactReport").fadeIn("fast");
            document.getElementById("ContactReportButton_OK").disabled = true;
        }
        function CancelReportContact(event) {
            if (event != undefined) {
                event.stopPropagation();
                event.preventDefault();
            }
            $("#ContactReport").fadeOut("fast");
            document.getElementById("ContactReportButton_OK").disabled = true;
        }
        function ContactReport_Changed(event) {
            if (event != undefined) {
                event.stopPropagation();
                event.preventDefault();
            }
            $("#ContactReportForm").find("input").each(function () {
                if (this.checked) {
                    contacttype = this.value;
                }
            });
            if (contacttype != undefined) {
                document.getElementById("ContactReportButton_OK").disabled = false;
            }
        }
        function ReportContact(event) {
            if (event != undefined) {
                event.stopPropagation();
                event.preventDefault();
            }
            // Incorrect Visual Element
            // Request a Feature
            // Report a bug
            $("#ContactReport").fadeOut("fast");
            let subject = "3D Dome Viewer - " + contacttype + ": " + DMGroup + " - " + DMProject;
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

            let id = GetVersionGroupID(new THREE.Vector3(chosenCamObj.SceneData.x, chosenCamObj.SceneData.y, chosenCamObj.SceneData.z));
            if (VersionGroups[id].length <= 1) { return; }

            let text = document.createElement('div');
            text.textContent = "Camera Versions:";
            text.style.color = "white";
            myNode.appendChild(text);

            let i = 0;
            VersionGroups[id].forEach(function (obj) {
                //if (obj != chosenCamObj) {
                let cvb = document.createElement('button');
                cvb.type = "button";
                cvb.className = "ButtonBarButton";
                cvb.textContent = i++;
                myNode.appendChild(cvb);

                cvb.addEventListener('click', function () {
                    ChangePOV(obj);
                }, false);
                // }
            });

        }


        // ============= Measure Tool =====================


        function CreateMeasurePoint() {

            MeasureClick += 1;

            if (MeasureClick == 3) {
                MeasurePoints.push(MeasureObjs);
                for (let i = 0; i < MeasurePoints.length; i++) {
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

                let material = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide });
                let geometry = new THREE.SphereGeometry(sz, 20);
                let mesh1 = new THREE.Mesh(geometry, material);
                MeasureObjs.add(mesh1);
                MeasurePoints.push(mesh1); // 0

                let mesh2 = new THREE.Mesh(geometry, material);
                MeasureObjs.add(mesh2);
                MeasurePoints.push(mesh2); // 1

                let mesh3geometry = new THREE.CylinderGeometry(sz / 3, sz / 3, 1, 3);
                let mesh3 = new THREE.Mesh(mesh3geometry, material);
                let pivotOffset = new THREE.Object3D();
                pivotOffset.add(mesh3);
                mesh3.rotation.set(90 / 180 * Math.PI, 0, 0);
                MeasureObjs.add(pivotOffset);
                MeasurePoints.push(pivotOffset); // 2

                raycaster.setFromCamera(mouse, camera);
                let intersects = raycaster.intersectObjects([measureCollideHorizontal]);
                if (intersects.length > 0) {
                    mesh1.position.set(intersects[0].point.x, 0, intersects[0].point.z);
                    mesh2.position.set(intersects[0].point.x, 0, intersects[0].point.z);
                    pivotOffset.position.set(intersects[0].point.x, 0, intersects[0].point.z);
                }
            }
        }


        function MoveMeasure() {

            raycaster.setFromCamera(mouse, camera);
            let intersects;

            //if (measureWidth) {
            //    intersects = raycaster.intersectObjects([measureCollideHorizontal]);
            //} else {
            //    // Vertical
            // intersects = raycaster.intersectObjects([measureCollideVertical]);
            //    // console.log(intersects);
            //}

            intersects = raycaster.intersectObjects([measureCollideCurrent]);

            //if (intersects.length > 0) console.log(intersects[0]);

            if (measureWidth && intersects.length > 0 && MeasureClick <= 1) {
                MeasurePoints[1].position.set(intersects[0].point.x, 0, intersects[0].point.z);

                measuredist = MeasurePoints[0].position.distanceTo(intersects[0].point);
                let px = intersects[0].point.x - MeasurePoints[0].position.x;
                let pz = intersects[0].point.z - MeasurePoints[0].position.z;
                let rad = Math.atan2(pz, px);

                let fifrad = (15 / 180 * Math.PI);
                rad = Math.floor(rad / fifrad);
                rad *= fifrad;

                MeasurePoints[1].position.set(
                    MeasurePoints[0].position.x + (Math.cos(rad) * measuredist),
                    0,
                    MeasurePoints[0].position.z + (Math.sin(rad) * measuredist),
                );

                MeasurePoints[2].lookAt(MeasurePoints[1].position); // cone look at second point
                MeasurePoints[2].children[0].scale.set(1, measuredist, 1);
                MeasurePoints[2].children[0].position.set(0, 0, measuredist / 2);
            }

            if (!measureWidth && intersects.length > 0 && MeasureClick <= 1) {
                MeasurePoints[1].position.set(
                    MeasurePoints[1].position.x,
                    intersects[0].point.y,
                    MeasurePoints[1].position.z);
                measuredist = MeasurePoints[0].position.distanceTo(MeasurePoints[1].position);
                MeasurePoints[2].lookAt(MeasurePoints[1].position); // cone look at second point
                MeasurePoints[2].children[0].scale.set(1, measuredist, 1);
                MeasurePoints[2].children[0].position.set(0, 0, measuredist / 2);
            }


            // round to 16th
            let measuredist2 = Math.abs(measuredist);
            let ft = Math.floor(measuredist2 / 12);
            let inch = Math.floor(measuredist2 - (ft * 12));
            let fraction = Math.floor((measuredist2 - inch - (ft * 12)) * 10);
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
            let hx = (pos2.x - pos1.x);
            let hy = (pos2.y - pos1.y);
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

            raycaster.setFromCamera(mouse, camera);
            let intersects = raycaster.intersectObjects(multideck.children);
            if (intersects.length > 0) {
                let d = 99999;
                let obj;
                for (let i = 0; i < intersects.length; i++) {
                    if (intersects[i].distance < d) {
                        d = intersects[i].distance;
                        obj = intersects[i];
                    }
                }
                if (obj != undefined) {
                    let pt = new THREE.Vector3(obj.point.x, obj.point.y, obj.point.z);
                    return pt;
                }
            }
            // cursor = "default";
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
                let lowest = 100;
                let nearest;

                camangles.children.forEach(function (child) {

                    // let id = Math.round(child.SceneData.x) + "," + Math.round(child.SceneData.y) + "," + Math.round(child.SceneData.z);
                    // if(VersionGroups[id] != undefined) { VersionGroups }
                    // The arrow points at itself when there are versions

                    const chp = new THREE.Vector3(child.position.x, child.SceneData.floor, child.position.z);

                    if (child != chosenCamObj) {
                        let dist = floorArrow.position.distanceTo(chp);
                        child.material.opacity = clamp(1 - (dist * 0.01), 0.05, 0.6);
                        if (dist < lowest) {
                            lowest = dist;
                            nearest = child;
                        }

                        if (child.name == "DomeViewer_Dome25") {

                            //console.log("----------");
                            //console.log(floorArrow.position);
                            //console.log(child);
                            //console.log(chp);

                            child.material.opacity = 1;
                            //console.log(dist);
                        }
                    }



                });

                // console.log(nearest);
                if (nearest != undefined) {
                    let nearestpos = new THREE.Vector3().copy(nearest.position);
                    nearestpos.y = floorposition.y;
                    floorArrow.lookAt(nearestpos);
                    floorArrow.nearest = nearest;
                    PreloadATexture(nearest);
                } else {
                    // let f = new THREE.Vector3(chosenCamObj.position.x, chosenCamObj.position.y+0.1, chosenCamObj.SceneData.floor + 0.1 );
                    // console.log("NOPE");
                    // floorArrow.lookAt(f);

                }

            }

            if (floorArrow.nearest == undefined) {
                if (floorArrow.mesh.material.map != floorIconTex["None"]) {
                    floorArrow.mesh.material.map = floorIconTex["None"];
                    floorArrow.mesh.material.needsUpdate = true;
                }
            } else {
                if (floorArrow.mesh.material.map != floorIconTex["Arrow"]) {
                    floorArrow.mesh.material.map = floorIconTex["Arrow"];
                    floorArrow.mesh.material.needsUpdate = true;
                }
            }
            //floorArrow.mesh.visible = (floorArrow.nearest != undefined);

        }


        // ================= Interaction Start ===============


        function FadeMenus(val) {
            let speed = "fast";
            if (val > 0.5) { speed = 1000; } // the low is not 0, but 0.2 about
            let g = ["FloorList", "TopMessage", "ButtonBar", "MainMenu", "CameraVersions"];
            for (let i = 0; i < g.length; i++) {
                if (!$("#" + g[i]).is(":hidden")) {
                    $("#" + g[i]).stop();
                    $("#" + g[i]).fadeTo(speed, val, function () {
                        // Animation complete.
                    });
                }
            }
        }


        function onDocumentMouseDown(event) {
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

            mouse.x = (onPointerDownPointerX / window.innerWidth) * 2 - 1;
            mouse.y = - (onPointerDownPointerY / window.innerHeight) * 2 + 1;

            if (Mobile.isMobile) { FloorIcon(); }
        }

        function onDocumentMouseMove(event) {
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

            // $("#NameBar").hide();

            if (isUserInteracting === true) {
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

                lon = (onPointerDownPointerX - mousePosX) * 0.1 + onPointerDownLon;
                lat = (mousePosY - onPointerDownPointerY) * 0.1 + onPointerDownLat;

            } else {

                if (!MeasureEnabled) {
                    // CheckForPOVIntersection(mouse);
                    if (!CheckForProdPosIntersection()) {
                        CheckForInfoBoxIntersection();
                    }
                }
            }

            isUserDragging = true;

            let bmx = mouse.x;
            let bmy = mouse.y;
            mouse.x = (mousePosX / window.innerWidth) * 2 - 1;
            mouse.y = - (mousePosY / window.innerHeight) * 2 + 1;
            // check that the mouse hasn't moved to enable click
            if (bmx - mouse.x == 0 && bmy - mouse.y == 0) { isUserDragging = false; }

        }

        function onDocumentMouseLeave(event) {

            fade = false;
            FadeMenus(1);

            if (event != undefined) {
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

            if (PROD_OBJECT != null && PROD_OBJECT != Selected_INFO_OBJECT) {
                // remove previous hover edits from previous hover object
                PROD_OBJECT.material.opacity = 0.05;
                //PROD_OBJECT.material.opacity = 0.2;
                //PROD_OBJECT.children[0].material.opacity = 0.2;
                //PROD_OBJECT.children[0].material.linewidth = 1;
            }
            PROD_OBJECT = null;

            // $("#NameBar").hide();
        }

        function onDocumentMouseUp(event) {

            if (event != undefined) {
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
                    if (!CheckForProdPosIntersection()) {
                        if (!CheckForInfoBoxIntersection()) {
                            if (floorArrow.nearest != undefined) {
                                ChangePOV(floorArrow.nearest);
                            }
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
                        if (INFO_OBJECT != Selected_INFO_OBJECT) {
                            Selected_INFO_OBJECT = INFO_OBJECT;
                            Selected_INFO_OBJECT.material.opacity = 0.1;
                            //Selected_INFO_OBJECT.wire.material.color = new THREE.Color("rgb(80, 255, 160)");
                            Selected_INFO_OBJECT.wire.material.opacity = 0.5;
                            WriteAllData(Selected_INFO_OBJECT.info);
                        }
                    }




                    if (PROD_OBJECT != null) {
                        if (Selected_INFO_OBJECT != undefined) {
                            Selected_INFO_OBJECT.material.opacity = 0.05;
                            //Selected_INFO_OBJECT.wire.material.color = new THREE.Color("rgb(20, 160, 230)");
                            Selected_INFO_OBJECT.wire.material.opacity = 0.2;
                            Selected_INFO_OBJECT = undefined;
                        }
                        if (PROD_OBJECT != Selected_INFO_OBJECT) {
                            Selected_INFO_OBJECT = PROD_OBJECT;
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

            // $("#NameBar").hide();
        }

        function onDocumentMouseWheel(event) {
            // WebKit
            if (event.wheelDeltaY) {
                camera.fov -= event.wheelDeltaY * 0.05;
                ZoomValue += event.wheelDeltaY;
                // Opera / Explorer 9
            } else if (event.wheelDelta) {
                camera.fov -= event.wheelDelta * 0.05;
                ZoomValue += event.wheelDelta;
                // Firefox
            } else if (event.detail) {
                camera.fov += event.detail * 1.0;
                ZoomValue += event.wheelDelta;
            }

            // zoom lock
            if (camera.fov > 89) camera.fov = 89;
            if (camera.fov < 17) camera.fov = 17;
            if (ZoomValue > 960) ZoomValue = 960;
            if (ZoomValue < -480) ZoomValue = -480;

            $("#ZoomText")[0].innerText = (ZoomValue / 120);
            camera.updateProjectionMatrix();

            // console.log(ZoomValue);
            // console.log(camera.fov);
        }


        // ================= Interaction End ===============


        function CheckForInfoBoxIntersection() {
            // called on onDocumentMouseMove

            let intersects = raycaster.intersectObjects(infoBoxes.children);

            if (INFO_OBJECT != null && INFO_OBJECT != Selected_INFO_OBJECT) {
                if (INFO_OBJECT.material != undefined) {
                    // remove previous hover edits from previous hover object
                    INFO_OBJECT.material.opacity = 0.05;
                }
                if (INFO_OBJECT.wire != undefined && INFO_OBJECT.wire.material != undefined) {
                    //INFO_OBJECT.material.opacity = 0.2;
                    INFO_OBJECT.wire.material.opacity = 0.2;
                    //INFO_OBJECT.children[0].material.linewidth = 1;
                }
            }

            if (intersects.length > 0) {
                //distance = Math.round(intersects[0].distance * 100) * 0.01;
                if (INFO_OBJECT != intersects[0].object && intersects[0].object.visible) {
                    INFO_OBJECT = intersects[0].object;
                }
            } else {
                INFO_OBJECT = null;
            }

            if (INFO_OBJECT != null) {
                // ShowNameBar(INFO_OBJECT.name);

                // An object has been intersected
                if (INFO_OBJECT.material != undefined) {
                    INFO_OBJECT.material.opacity = 0.1;
                }
                if (INFO_OBJECT.wire != undefined && INFO_OBJECT.wire.material != undefined) {
                    INFO_OBJECT.wire.material.opacity = 0.5;
                }
                //INFO_OBJECT.children[0].material.linewidth = 13;
                //console.log(INFO_OBJECT.children[0].material.linewidth);
                //WriteAllData(INFO_OBJECT.children[0]);//.children[0].visibile = true;
                cursor = "pointer";
                //floorArrow.visible = false;
                return true;
            }
            //floorArrow.visible = true;
            return false;
        }

        function CheckForProdPosIntersection() {
            // called on onDocumentMouseMove
            const g = [];
            for (let i = 0; i < ProdPossObjs.length; i++) {
                g.push(ProdPossObjs[i].mesh);
            }
            //let intersects = raycaster.intersectObjects( infoBoxes.children );
            let intersects = raycaster.intersectObjects(g);

            if (PROD_OBJECT != null && PROD_OBJECT != Selected_INFO_OBJECT) {
                // remove previous hover edits from previous hover object
                PROD_OBJECT.material.opacity = 0.05;
                //PROD_OBJECT.material.opacity = 0.2;
                PROD_OBJECT.wire.material.opacity = 0.2;
                //PROD_OBJECT.children[0].material.linewidth = 1;
            }

            if (intersects.length > 0) {
                //distance = Math.round(intersects[0].distance * 100) * 0.01;
                if (PROD_OBJECT != intersects[0].object && intersects[0].object.visible) {
                    PROD_OBJECT = intersects[0].object;
                }
            } else {
                PROD_OBJECT = null;
            }

            if (PROD_OBJECT != null) {
                // ShowNameBar(PROD_OBJECT.name);

                // An object has been intersected
                PROD_OBJECT.material.opacity = 0.1;
                PROD_OBJECT.wire.material.opacity = 0.5;
                //PROD_OBJECT.children[0].material.linewidth = 13;
                //console.log(PROD_OBJECT.children[0].material.linewidth);
                //WriteAllData(PROD_OBJECT.children[0]);//.children[0].visibile = true;
                cursor = "pointer";
                //floorArrow.visible = false;
                return true;
            }

            //floorArrow.visible = true;
            return false;
        }


        // ================= Intersection Check End ===============


        function DrawCross() {
            // for testing purposes
            $("#cross").show();
            // Used to visually find the perfect center of the screen
            // draws to lines like an X so you can see the center
            let c = document.getElementById("cross");
            c.width = window.innerWidth / 2;
            c.height = window.innerHeight;
            let ctx = c.getContext("2d");
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo($(c).width(), $(c).height());
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo($(c).width(), 0);
            ctx.lineTo(0, $(c).height());
            ctx.stroke();
        }


        function InchesToFeeet(inches) {
            let feet = Math.floor(inches / 12);
            inches %= 12;
            inches = Math.round(inches * 10) / 10
            return feet + "'-" + inches + '"';
        }


        function DrawSprite(sz, imgsrc) {
            let texture = new THREE.TextureLoader().load(imgsrc);
            let material = new THREE.SpriteMaterial({ map: texture, });
            material.depthTest = false;
            let object = new THREE.Sprite(material);
            object.scale.set(sz, sz, 1);
            object.position.set(0, 0, 0);
            return object;
        }


        function WriteAllData(object) {

            let write = "";//"Object Info:</br>";
            let keys = Object.keys(object);
            let k = "";
            keys.forEach(function (entry) {
                //console.log(entry);
                if (entry == "name" || entry == "note" || entry == "UPC" || entry == "itemnumber" || (entry.endsWith("_link") && object[entry] != "")) {

                    write += "<div class=\"objInfo_Block\"><p><span class=\"objInfo_Label\">" + entry;

                    if (entry.endsWith("_link")) { // links
                        //write += entry.replace("_link", "") + ": <a class=\"objInfo_Block\" target=\"_blank\"  href=\"" + object[entry] +  "\">Link</a></br>" ;
                        write += ": <a class=\"objInfo_ValueLink\" target=\"_blank\"  href=\"" + object[entry] + "\">" + object[entry] + "</a>";
                    }
                    else { write += ": </span><span class=\"objInfo_Value\">" + object[entry] + "</span></p>"; }

                    write += "</div></br>";
                }
            });
            document.getElementById("ObjectInfoText").innerHTML = write;

            if (write == "") {//"Object Info:</br>"){
                CloseObjectInfo();
            }
            else {
                $("#ObjectInfo").stop().fadeTo("fast", 1, function () {
                    // Animation complete.
                });
                $("#ObjectInfoArrow").stop().fadeTo("fast", 1, function () {
                    // Animation complete.
                });
            }
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
                    ObjectInfo.offsetLeft,
                    ObjectInfo.offsetTop
                ); // offsets based on the size of the info box

                let pos2 = ObjectCenterToScreenPos(Selected_INFO_OBJECT.infoPoint);

                if (pos2.x > pos1.x) pos1.x += ObjectInfo.offsetWidth;

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


        function BezierBlend(t) {
            return t * t * (3.0 - 2.0 * t);
        }



        function AccelOn(event) {
            if (event != undefined) {
                event.stopPropagation();
                event.preventDefault();
            }

            //if (BlockDoubleTap()) return;
            $("#CenterDiv").toggle();
            Mobile.isAccel = !Mobile.isAccel;
            AutoRotateOff();
            if (controls == undefined) {
                controls = new DeviceOrientationControls(camera);
                controls.connect();
            }

            //let g = document.getElementById("AccelIcon");
            //if (g.className == "AccelIconOn imageButton") g.className="AccelIcon imageButton";
            //else { g.className="AccelIconOn imageButton"; }
        }


        function animate() {
            requestAnimationFrame(animate);
            update();
        }


        function update() {

            let delta = clock.getDelta();
            // CurrentDome.material.opacity = 1;
            // START Click movement

            if (INFO_OBJECT != undefined || PROD_OBJECT != undefined || floorArrow.mesh.material.map == floorIconTex["None"]) {
                if (floorArrow.mesh.material.opacity > 0) floorArrow.mesh.material.opacity -= 0.1;
                if (cursor != "pointer" && cursor != "grabbing") cursor = "grab";
            }
            else if (floorArrow.mesh.material.opacity < 0.6) floorArrow.mesh.material.opacity += 0.04;

            const totalDistance = PositionStart.distanceTo(PositionEnd);
            if (totalDistance == 0) { lerpFloat = 1; CurrentDome.scale.set(1, 1, 1); }

            lerpFloat += delta * 1; // greater number is faster
            if (lerpFloat > 1) lerpFloat = 1;
            let diff = new THREE.Vector3().subVectors(PositionEnd, PositionStart);
            diff.multiplyScalar(BezierBlend(lerpFloat));
            diff.add(PositionStart);

            camera.position.copy(diff);

            const cameraDistance = camera.position.distanceTo(PositionEnd);
            let g = (totalDistance - cameraDistance) / totalDistance * 2;
            if (totalDistance == 0 || g > 1) g = 1;
            if (true) { // for testing - hides the domes
                CurrentDome.material.opacity = g;
                OldDome.material.opacity = 1 - g;
            }

            autoRotateinc += delta * 0.005;
            if (autoRotateinc > autoRotatemax) autoRotateinc = autoRotatemax;
            if (!disableAutoRotate) {
                lon += autoRotateinc;
            }
            //getLocation(); // -------- FUTURE ADDITIONS GPS coords




            // NameBarPosition();
            ObjectInfoPosition();
            // LookSelection();

            if (Mobile.isAccel) {
                controls.update();
                //LookSelection();
            }
            else {
                //document.getElementById("NameBar").innerText = lon;
                lat = Math.max(- 85, Math.min(85, lat));
                phi = THREE.Math.degToRad(90 - lat);
                theta = THREE.Math.degToRad(lon);

                // 50000 is the hypotenuse
                // it does look at a point on the ImageDomes
                camera.target.x = 50000 * Math.sin(phi) * Math.cos(theta);
                camera.target.y = 50000 * Math.cos(phi);
                camera.target.z = 50000 * Math.sin(phi) * Math.sin(theta);

                camera.lookAt(camera.target);
            }


            // when the sprite connects to the camera it dissapears
            //let camforward = new THREE.Vector3(0,0,0);
            //camera.getWorldDirection(camforward);
            //camforward.multiplyScalar(50010);
            //camforward.add(camera.position);
            //loadingSprite.position.copy(camforward);



            if (MeasureClick >= 1) {
                MoveMeasure();
            }


            if (MeasureEnabled) cursor = "crosshair";
            InteractionDiv.style.cursor = cursor;


            /*
            // distortion
            camera.position.copy( camera.target ).negate();
            */

            if (Mobile.isStereo) {
                effect.render(scene, camera);
            }
            else {
                renderer.render(scene, camera);
            }

            //ImageDome2.material.opacity -= 0.00001;


            if (!infoboxMoveBarDown) {
                infoboxMoveBarX = mousePosX - document.getElementById("ObjectInfo").offsetLeft;
                infoboxMoveBarY = mousePosY - document.getElementById("ObjectInfo").offsetTop;
            } else {
                document.getElementById("ObjectInfo").style.left = mousePosX - infoboxMoveBarX + "px";
                document.getElementById("ObjectInfo").style.top = mousePosY - infoboxMoveBarY + "px";
                //ObjectInfoPosition();
            }
            if (!infoboxResizeDown) {
                infoboxResizeX = (document.getElementById("ObjectInfo").offsetLeft + document.getElementById("ObjectInfo").offsetWidth) - mousePosX;
                infoboxResizeY = (document.getElementById("ObjectInfo").offsetTop + document.getElementById("ObjectInfo").offsetHeight) - mousePosY;
            } else {
                document.getElementById("ObjectInfo").style.width = mousePosX - document.getElementById("ObjectInfo").offsetLeft + infoboxResizeX + "px";
                document.getElementById("ObjectInfo").style.height = mousePosY - document.getElementById("ObjectInfo").offsetTop + infoboxResizeY + "px";
            }
        }


        function CamPosLoaded(Module) {
            SceneData = new Module.SceneData;
            Init();
        }
        function CamPosLoaded2() {
            Init();
        }


        this.START = function () {

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
                for (let i = 0; i < DomeProjectData.length; i++) {
                    if (DMGroup == DomeProjectData[i].group && DMProject == DomeProjectData[i].project) {
                        camposfile = DomeProjectData[i].dataFile;
                        break;
                    }
                }

                if (camposfile == undefined) {
                    alert("A project with that name was not found. Check the DomeProjectsDataList to see if the project's data file (CamPos.json) was logged. The data file may be incomplete or missing.");
                }

                let camposfilepath = uploadsDir + camposfile; // camposfile contains Dome_Projects and _private
                if (camposfile.includes("_private")) uploadsDir += "_private/";
                if (!camposfilepath.includes('json')) {
                    const rr = import(camposfilepath);
                    rr.then(function (result) { CamPosLoaded(result); });
                } else {
                    //let jsonfile = camposfilepath.replace(".js", ".json");
                    readTextFile(camposfilepath, function (text) {
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

            if (!a.includes("?")) { return; }
            document.getElementById("TitleBarText").innerText = decodeURIComponent(DMProject);

            $("#ObjectInfo").hide();
            $("#ObjectInfoArrow").hide();

            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                Mobile.MobileOn();
                $("#StereoButton").hide();
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