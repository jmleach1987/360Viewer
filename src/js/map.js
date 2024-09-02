class map {
	
	constructor( object ) {

		// ============= Map Start =====================

		function MakeMapCamera() {
			
			//let mapimage = new Image();
			//mapimage.src = uploadsDir + DMGroup + '/' + DMProject + '/map.jpg';


			//let texloader = new THREE.TextureLoader();
			let mapmap = texloader.load(uploadsDir + DMGroup + '/' + DMProject + '/map.jpg');
			
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
	}
}
export { map };