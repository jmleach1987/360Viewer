import { StereoEffect } from './effects/StereoEffect.js?v1.1';

class Mobile {

    constructor(object) {
    }

    static touched = false;
    static isMobile = false;
    static isStereo = false;
    static isAccel = false;
    static POV_VectorAngles = [];
    static hoverTime = 0;
    static lasttime;
    static iv;
    static EnableSelectionTimer;
    static noSelect = true;

    static BlockDoubleTap() {
        if (touched != undefined) return true;
        touched = setTimeout(function () { touched = undefined; }, 100);
        return false;
    }
    static MobileOn() {
        this.isMobile = true;
        //lowRes = "lowRes/";

        $("#TitleBar").css({
            "height": "34px",
        });
        $("#TitleBarText").css({
            "font-size": "1.4em",
            "padding": "0px 70px",
            "bottom": "17px"
        });
        $("#TitleBarLogo").css({
            "width": "50px",
            "padding": "0px 10px"
        });
        $("#ObjectInfoText").css({
            "padding": "0.2em"
        });
    }

    static StereoOn(event) {
        if (event != undefined) {
            event.stopPropagation();
            event.preventDefault();
        }
        //if (BlockDoubleTap()) return;
        this.isStereo = !this.isStereo;
        $("#CenterPoint, #DoublePointLeft, #DoublePointRight, #DoublePointCirlceLeft, #DoublePointCirlceRight").toggle();
        if (effect == undefined) {
            effect = new THREE.StereoEffect(renderer);
            effect.setSize(window.innerWidth, window.innerHeight);
        }

        this.isAccel = this.isStereo;
        if (controls == undefined) {
            controls = new THREE.DeviceOrientationControls(camera);
            controls.connect();
        }

        //let g = document.getElementById("StereoIcon");
        //if (g.className == "StereoIconOn imageButton") { g.className="StereoIcon imageButton"; document.getElementById("AccelIcon").className="AccelIcon imageButton"; }
        //else { g.className="StereoIconOn imageButton"; document.getElementById("AccelIcon").className="AccelIconOn imageButton"; }

        if (this.isAccel) {
            $("#CenterDiv").show();
        } else { $("#CenterDiv").hide(); }

        onWindowResize();
    }

    

    // ============= Mobile End =====================



    // ================= Look Selection Start =================


    static GetAllPOVAngles() {
        // get the angle from camera position
        // to the POV
        POV_VectorAngles = [];
        let oldRot = new THREE.Vector3(camera.rotation.x, camera.rotation.y, camera.rotation.z);
        for (let i = 0; i < SceneData.CamPos.length; i++) {
            if (SceneData.CamPos[chosenPOV].name == SceneData.CamPos[i].name) continue;
            let vector = new THREE.Vector3(SceneData.CamPos[i].x, 40, SceneData.CamPos[i].z);

            camera.lookAt(vector);

            vector = new THREE.Vector3(camera.rotation.x, camera.rotation.y, camera.rotation.z);
            while (vector.x < 0) vector.x = vector.x + (Math.PI * 2);
            while (vector.y < 0) vector.y = vector.y + (Math.PI * 2);
            while (vector.z < 0) vector.z = vector.z + (Math.PI * 2);

            POV_VectorAngles.push({ name: SceneData.CamPos[i].name, vector: vector, index: i });
        }
        camera.rotation.set(oldRot);
    }



    static LookSelection() {
        // create the look selection timer if it doesn't exist
        if (EnableSelectionTimer == undefined) {
            EnableSelectionTimer = setTimeout(function () {
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
                if (this.isStereo) { $("#DoublePointCirlceLeft, #DoublePointCirlceRight").show(); }
                else { $("#CenterPointCirlce").show(); }
                iv = setInterval(function () {
                    if (hoverTime >= Math.PI * 2) {
                        clearInterval(iv);
                        iv = undefined;
                        hoverTime = 0;
                        $("#CenterPointCirlce, #DoublePointCirlceLeft, #DoublePointCirlceRight").hide();
                        ClearCircles();
                        $("#NameBar").hide();
                        ChangePOV(INTERSECTED);
                        console.log("povpo");
                        RefreshZoom();
                    }
                    drawSelectionArc();
                }, 1000 / 30);
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
                if (this.isStereo){ $("#DoublePointCirlceLeft, #DoublePointCirlceRight").show();  }
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


    static ClearCircles() {
        let circles = ["CenterPointCirlce", "DoublePointCirlceRight", "DoublePointCirlceLeft"];
        for (i = 0; i < circles.length; i++) {
            let c = document.getElementById(circles[i]);
            let ctx = c.getContext("2d");
            ctx.clearRect(0, 0, c.width, c.height);
        }
    }


    static drawSelectionArc() {
        let dt = new Date();

        if (lasttime == undefined) {
            lasttime = dt.getTime();
        }
        newtime = dt.getTime();
        let difftime = newtime - lasttime;
        lasttime = newtime;
        if (difftime == 0 || difftime > 1000) { return; }

        let seconds = 3;
        hoverTime += (difftime / (seconds * 1000)) * (Math.PI * 4);

        let circles = ["CenterPointCirlce", "DoublePointCirlceRight", "DoublePointCirlceLeft"];
        for (i = 0; i < circles.length; i++) {
            let c = document.getElementById(circles[i]);
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


}

export { Mobile };