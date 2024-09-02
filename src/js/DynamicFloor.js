/**
 *
 * - Given a list of vector3 points
 * - Cluster the points based on a grid
 * - Find the center the group of points
 * - Ignore the points on the interior
 * - Create a nunber of points at a buffer distance from each point
 * - Skip creating buffer points if they are closer
 *   to the center than the point and within a minor angle.
 *   This effectively only creates points around the exterior.
 * - Sort all the points by angle from their center
 *
*/


import * as THREE from './build/three.module.js?v1.1';


class DynamicFloor {

    // static scene = undefined;

    constructor(_scene, _campositions, _merge, _numpoints, _pointBuffer) {

        const scene = _scene;

        // the amount of buffer points to make around each point
        const NumPoints = _numpoints; //5;
        // the distance from each point to the buffer points
        const PointBuffer = _pointBuffer; //30;

        // used for testing
        // array containing animated text on screen divs
        const sc = [];

        // pseudo random that accepts a seed
        const seed = 10;
        function Myrandom() {
            let num = Math.sin(seed++) * 10000;
            num = num - Math.floor(num);
            return num;
        }

        /**
         * updates the position of all of the screen
         * text stored in the sc array
        */
        function UpdateText() {

            for (let i = 0; i < sc.length; i++) {
                const pos = ObjectToScreen(sc[i].obj);
                sc[i].elem.style.left = pos.x + "px";
                sc[i].elem.style.top = pos.y + "px";
            }

        }

        // changes the value of a to b using the percent f
        function lerp(a, b, f) {

            return a + f * (b - a);

        }


        /*
         * figures out the straight up position from a given point
         * used with the test arrow
        */
        function UpPosition(pos, d) {

            if (d == undefined) d = 10; // default value
            return new THREE.Vector3().addVectors(pos, new THREE.Vector3(0, d, 0));

        }


        // Used for testing. Creates an arrow to point at points
        function MakeArrow(pos, pos2, c, txt) {

            if (scene == undefined) return;

            const dir = new THREE.Vector3();
            dir.subVectors(pos2, pos).normalize();;
            //normalize the direction vector (convert to vector of length 1)
            const origin = pos;

            let hex;
            if (c == 0) hex = 0xffff00;
            if (c == 1) hex = 0x5DDAFF;
            if (c == 2) hex = 0x62FF46;
            if (c == 3) hex = 0xFF46E9;
            if (c == 4) hex = 0xFF4654;
            if (c >= 5) hex = 0xFFB946;

            const arrowHelper = new THREE.ArrowHelper(dir, origin, pos.distanceTo(pos2) * 0.8, hex, 1, 1);
            scene.add(arrowHelper);

            if (txt != undefined) {

                const para = document.createElement("p");
                para.innerText = txt;
                para.style.position = "absolute";
                para.style.fontSize = "9px";
                // para.style.top = "0px";
                document.body.appendChild(para);

                const g = { "obj": arrowHelper, "elem": para };

                sc.push(g);
            }

        }


        // Convert a dictionary to a sorted array
        function ArrayFromOrderedDictKeys(dict) {

            let keys_ordered = Object.keys(dict);
            keys_ordered.sort();
            keys_ordered.reverse();

            const arr = [];
            for (let i = 0; i < keys_ordered.length; i++) {
                arr.push(dict[keys_ordered[i]]);
            }

            // close the array
            if (arr[arr.length - 1] != arr[0]) { arr.push(arr[0]); }

            return arr;
        }


        // Make all the main points
        function MakeMainPoints(grp, middle) {

            const PointObjs = {};

            for (let i = 0; i < grp.length; i++) {

                const popar = {
                    "middle": middle,
                    "pos": grp[i].position,
                    "ang": Math.atan2(grp[i].position.z - middle.z, grp[i].position.x - middle.x),
                    "dist": middle.distanceTo(grp[i].position),
                    "parent": undefined,
                    "id": i,
                    "children": []
                };
                while (popar.ang < 0) popar.ang += Math.PI * 2;
                PointObjs[popar.ang] = popar;

                // MakeArrow(grp[i].position, UpPosition(grp[i].position), 1, i);

            }

            return ArrayFromOrderedDictKeys(PointObjs);
        }


        function MakeBufferPoints(mainPoints) {
            // Generate PointBuffer points around point
            // rotate from the point n times at distance PointBuffer
            // record the angles from middle
            // forget the main point

            const childpoints = {};

            for (let i = 0; i < mainPoints.length; i++) {

                let popar = mainPoints[i];

                // start at the angle of the point
                let tmp = popar.ang;

                // protect the points of the same location
                for (let j = 0; j <= NumPoints; j++) {

                    tmp += (Math.PI * 2) / (NumPoints + 1.02);
                    let tmppos = new THREE.Vector3(
                        popar.pos.x + (Math.cos(tmp) * PointBuffer),
                        popar.pos.y,
                        popar.pos.z + (Math.sin(tmp) * PointBuffer)
                    );


                    const tmpdist = popar.middle.distanceTo(tmppos);
                    // if the new point distance to the middle
                    // is shorter than the main point distance to the middle
                    // ignore it because it is on the inside of the mesh
                    if (tmpdist < popar.dist) continue;


                    // get the angle to the point from the middle
                    let tmpangle = Math.atan2(tmppos.z - popar.middle.z, tmppos.x - popar.middle.x);
                    while (tmpangle < 0) tmpangle += Math.PI * 2;
                    // ang_pos[tmpangle] = tmppos;

                    const po = {
                        "middle": popar.middle,
                        "pos": tmppos,
                        "ang": tmpangle,
                        "dist": tmpdist,
                        "parent": popar,
                    };
                    popar.children.push(po);
                    childpoints[tmpangle] = po;
                }

            }

            return ArrayFromOrderedDictKeys(childpoints);
        }


        function FilterPerimeterpoints(arr) {

            //Filter out all but perimeter points

            const keepers = [];

            for (let i = 0; i < 5000; i++) // instead of a while
            {
                //if (arr.length != 25) break; // test

                let ind = i % (arr.length - 1);

                // find the next point with the shortest angle
                let popar = arr[ind];

                let least = -9999;
                let leastpoint = -1;

                for (let j = 0; j < arr.length; j++) {
                    let poparnext = arr[j];

                    if (popar == poparnext) continue;

                    // the angle from the first point to the test
                    let testang = Math.atan2(
                        poparnext.pos.z - popar.pos.z,
                        poparnext.pos.x - popar.pos.x,
                    );
                    testang -= popar.ang;
                    while (testang < 0) testang += Math.PI * 2;
                    while (testang > Math.PI * 2) testang -= Math.PI * 2;

                    if (least < testang) {
                        least = testang;
                        leastpoint = j;
                    }

                }

                keepers.push(arr[leastpoint]);

                if (i > leastpoint) {
                    // console.log("END");
                    break;
                }

                i = leastpoint - 1;
            }

            return keepers;
        }


        function GetPointPositions(arr) {
            const pos = [];
            for (let i = 0; i < arr.length; i++) {
                pos.push(arr[i].pos);
            }
            return pos;
        }


        function MakeCube(pos, color, sz) {
            if (sz == undefined) sz = 1;
            if (color == undefined) color = "green";
            const testbox = new THREE.Mesh(
                new THREE.BoxGeometry(1, 1, 1),
                new THREE.MeshBasicMaterial({ color: color }) // flatShading: true
            );
            testbox.position.set(pos.x, pos.y, pos.z);
            testbox.scale.set(sz, sz, sz);
            scene.add(testbox);
            return testbox;
        }


        function FindParent(me) {

            const added = [];
            for (let i = 0; i < 100; i++) {

                if (added.indexOf(me) != -1) { // console.log( "added END" ); 
                    break;
                }
                added.push(me);
                if (me.parent == undefined) { // console.log( "parent END" ); 
                    break;
                }
                me = me.parent;

            }

            return me;
        }


        function clusterpoints(campositions, merge) {

            const locdict = {};

            for (let i = 0; i < campositions.length; i++) {

                // convert the string position to vector3
                const p = new THREE.Vector3(
                    parseFloat(campositions[i].position.x),
                    parseFloat(campositions[i].position.y),
                    parseFloat(campositions[i].position.z)
                );

                // round the vector to a grid position
                const p2 = new THREE.Vector3(
                    parseInt(Math.round(p.x) / merge) * merge,
                    parseInt(Math.round(p.y) / 10) * 10,
                    parseInt(Math.round(p.z) / merge) * merge
                );

                // make the position into a key for a dictionary
                const k = p2.x + "," + p2.y + "," + p2.z;

                //if (p2.distanceTo(p) < merge) {
                    if (locdict[k] == undefined) {
                        locdict[k] = [];
                    }
                    locdict[k].push(campositions[i]);
                //}
            }

            const meshes = [];
            // put them in order of angle
            Object.keys(locdict).forEach(key => {
                //for (let key=0; key < locdict.length; key++) {

                const grp = locdict[key];

                const middle = FindMiddle(grp);

                // 
                const mainPoints = MakeMainPoints(grp, middle);
                const childpoints = MakeBufferPoints(mainPoints);

                //let keepers = FilterPerimeterpoints(mainPoints);
                //const childpoints = MakeBufferPoints(keepers, 5, 8);

                const keepers = FilterPerimeterpoints(childpoints);

                const orderedpositions = GetPointPositions(keepers);

                if (orderedpositions[0].x != orderedpositions[orderedpositions.length - 1].x) {
                    orderedpositions.push(orderedpositions[0]);
                }

                meshes.push(makepoly(middle, orderedpositions));

            });

            return meshes;
        }


        function FindMiddle(grp) {

            const min = new THREE.Vector3();
            min.addScalar(9999999);

            const max = new THREE.Vector3();
            max.addScalar(-9999999);

            for (let i = 0; i < grp.length; i++) {
                if (grp[i].position.x < min.x) min.x = grp[i].position.x;
                if (grp[i].position.y < min.y) min.y = grp[i].position.y;
                if (grp[i].position.z < min.z) min.z = grp[i].position.z;

                if (grp[i].position.x > max.x) max.x = grp[i].position.x;
                if (grp[i].position.y > max.y) max.y = grp[i].position.y;
                if (grp[i].position.z > max.z) max.z = grp[i].position.z;
            }

            max.sub(min);
            const middle = new THREE.Vector3(
                min.x + (max.x / 2),
                min.y + (max.y / 2),
                min.z + (max.z / 2)
            );

            return middle;
        }


        function FindAvgMiddle(grp) {

            const middle = new THREE.Vector3();

            for (let i = 0; i < grp.length; i++) {
                if (grp[i].position != undefined) middle.add(grp[i].position);
                else middle.add(grp[i]);
            }
            middle.divideScalar(grp.length);

            return middle;

        }


        function ObjectToScreen(object) {

            const width = window.innerWidth, height = window.innerHeight;
            const widthHalf = width / 2, heightHalf = height / 2;

            let pos = new THREE.Vector3();

            pos = pos.setFromMatrixPosition(object.matrixWorld);
            pos.project(camera);

            pos.x = (pos.x * widthHalf) + widthHalf;
            pos.y = - (pos.y * heightHalf) + heightHalf;
            pos.z = 0;

            return pos;

            /*
            const vector = new THREE.Vector3();
            const projector = new THREE.Projector();
            projector.projectVector( vector.setFromMatrixPosition( object.matrixWorld ), camera );

            vector.x = ( vector.x * widthHalf ) + widthHalf;
            vector.y = - ( vector.y * heightHalf ) + heightHalf;
        	
            return vector;
            */

        }


        function showlines(grp) {

            const material = new THREE.LineBasicMaterial({ color: "yellow", flatShading: true });
            const middle = FindMiddle(grp);

            const points = [];
            points.push(middle);
            for (let i = 0; i < grp.length; i++) { // 
                points.push(grp[i].position);
                points.push(middle);
            }

            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, material);
            scene.add(line);

        }


        function makepoly(middle, points) {

            // ---

            // pass an array of vector2 in order
            const geometry = new THREE.BufferGeometry();

            // create a simple square shape. We duplicate the top left and bottom right
            // vertices because each vertex needs to appear once per triangle.
            //const vertices = new Float32Array( [
            //	-1.0, -1.0,  1.0,
            //	 1.0, -1.0,  1.0,
            //	 1.0,  1.0,  1.0,

            //	 1.0,  1.0,  1.0,
            //	-1.0,  1.0,  1.0,
            //	-1.0, -1.0,  1.0
            //] );


            // const points = [
            //	new THREE.Vector2(10, 3),
            //	new THREE.Vector2(11, 1),
            //	new THREE.Vector2(8, -5),
            //	new THREE.Vector2(3, -8),
            //];

            const v = [];
            for (let i = 0; i < points.length - 1; i++) {
                v.push(
                    middle.x, middle.y, middle.z,
                    points[i].x, points[i].y, points[i].z,
                    points[i + 1].x, points[i].y, points[i + 1].z,
                );
            }

            const vertices = new Float32Array(v);
            // itemSize = 3 because there are 3 values (components) per vertex
            geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
            const material = new THREE.MeshBasicMaterial({
                color: "blue",
                visible: false,
                opacity: 0.3,
                transparent: false,
                side: THREE.DoubleSide
            });
            const mesh = new THREE.Mesh(geometry, material);
            // scene.add(mesh);

            /*
        	
            const wireframe = new THREE.WireframeGeometry( geometry );
        	
            const line = new THREE.LineSegments( wireframe );
            line.material.depthTest = false;
            line.material.opacity = 0.25;
            line.material.transparent = true;
            mesh.add( line );
        	
            */

            return mesh;
        }


        this.floor_meshes = clusterpoints(_campositions, _merge);

    }
}

export { DynamicFloor };
