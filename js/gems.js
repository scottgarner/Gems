
"use strict"

var camera, scene, renderer, controls;
var clock = new THREE.Clock();

var gemTower;
var gemGeometry;
var nextGem = 0;
var textureCube;

var localStream = null;

var webcam, videoCanvas;

//

init();

//

function init() {

	// WebGL Check

	if (!window.WebGLRenderingContext || !document.createElement( 'canvas' ).getContext( 'experimental-webgl' )) {

		console.log("No go.");
		document.getElementById('error').style.display = "block";
		return 0;
	}

	//

	webcam = document.getElementById('webcam');
	videoCanvas = document.getElementById('videoCanvas');

	//

	var r = "./textures/cube/studio/";
	var urls = [ r + "posx.jpg", r + "negx.jpg",
	                 r + "posy.jpg", r + "negy.jpg",
	                 r + "posz.jpg", r + "negz.jpg" ];

	textureCube = THREE.ImageUtils.loadTextureCube( urls );
	textureCube.format = THREE.RGBFormat;

	//

	var container = document.getElementById( 'render' );
	document.body.appendChild( container );

	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
	camera.position.z = 12;	

	controls = new THREE.OrbitControls( camera );

	controls.minPolarAngle = Math.PI/2; // radians
	controls.maxPolarAngle = Math.PI/2; // radians

	controls.minDistance = 12;
	controls.maxDistance = 12;

	controls.autoRotate = true;

	// scene

	scene = new THREE.Scene();

	scene.add( camera );

	var ambient = new THREE.AmbientLight( 0x888888);
	scene.add( ambient );

	var directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(0, 1, 0).normalize();
    scene.add(directionalLight);	

	// Gem group

	gemTower = new THREE.Object3D();
	scene.add(gemTower);

	// model

	var loader = new THREE.JSONLoader();
	loader.load( './obj/gem.js' ,  function ( geometry, materials  ) {

		gemGeometry = geometry;

	});
	
	// Media

	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
	window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;	


	function fallback(e) {
	 	console.log("No media.")
	}

	function success(stream) {
		localStream = stream;
	 	webcam.src = window.URL.createObjectURL(stream);
	}

	if (!navigator.getUserMedia) {
		fallback();
	} else {
		navigator.getUserMedia({video: true}, success, fallback);
	}

	//

	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setClearColorHex( 0x000000, 0 );
	container.appendChild( renderer.domElement );

	//

	window.addEventListener( 'resize', onWindowResize, false );

	//

	animate();

}

function makeGem() {

	var geometry = gemGeometry.clone();

	if (geometry == null) return;

	var randomX = Math.random() * Math.PI/3 + Math.PI/8;
	var randomY = Math.random() *Math.PI * 2;
	//var randomY = (Math.sin(clock.getElapsedTime() * 100) + 1) * Math.PI ;
	geometry.applyMatrix( new THREE.Matrix4().setRotationFromEuler(new THREE.Vector3(randomX, randomY, 0), 'YXZ'));

	var videoData;
	if (localStream) {
			videoData = videoCanvas.getContext('2d').getImageData(0, 0, videoCanvas.width, videoCanvas.height).data;		
	}

	for ( var i = 0; i < geometry.vertices.length; i++ ) 
	{
		var point = geometry.vertices[ i ];
		var color = new THREE.Color( 0xffffff );

		if (localStream) {
			var dataIndex = i * 4;
        	color.setRGB( videoData[dataIndex]/255, videoData[dataIndex+1]/255, videoData[dataIndex+2] /255);	

		} else {
			color.setRGB( Math.random(), Math.random(), Math.random() );
		}
	    geometry.colors[i] = color; // use this array for convenience
	}

	var faceIndices = [ 'a', 'b', 'c', 'd' ];

	for ( var i = 0; i < geometry.faces.length; i++ ) 
	{
		var face = geometry.faces[ i ];
		var numberOfSides = ( face instanceof THREE.Face3 ) ? 3 : 4;
		for( var j = 0; j < numberOfSides; j++ ) 
		{
			var vertexIndex = face[ faceIndices[ j ] ];
			face.vertexColors[ j ] = geometry.colors[ vertexIndex ];
		}
	}

	var materials = [
		new THREE.MeshPhongMaterial( { ambient: 0xffffff, color: 0xffffff,
			specular: 0x888888, shininess: 30, envMap:textureCube, 
			combine: THREE.MixOperation, reflectivity: 0.35, vertexColors: THREE.VertexColors  }),
	// new THREE.MeshLambertMaterial( { color: 0xffffff, 
	// 	shading: THREE.FlatShading, vertexColors: THREE.VertexColors }),
	 // new THREE.MeshBasicMaterial( { color: 0xffffff, shading: THREE.FlatShading,
	 // 	wireframe: true, transparent: true, wireframeLinewidth: 2 } )

	];

	var mesh = THREE.SceneUtils.createMultiMaterialObject( geometry, materials );

	//mesh.children[ 1 ].scale.multiplyScalar( 1.01 );

	gemTower.add( mesh );

	// Animate it

	mesh.scale = {x: 0, y: 0, z: 0};
	var randomScale = .5 + Math.random()  ;
	var scaleTween = new TWEEN.Tween(mesh.scale)
		.to ({x: randomScale, y: randomScale * 1.25, z: randomScale}, 1000)
		.easing( TWEEN.Easing.Cubic.Out )
		.start();


    var tween = new TWEEN.Tween( mesh.position)
        .to( { y: -10 }, 6000 )
        .onComplete( function () {
        	gemTower.remove(mesh);
        } )
        .start();	


}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

//

function animate() {

	// Update video colors

	if (localStream) {

		var videoContext = videoCanvas.getContext('2d');

		videoContext.drawImage(webcam, 0, 0, videoCanvas.width, videoCanvas.height);
	}

	// Make new gems

	if (nextGem < clock.getElapsedTime() && gemGeometry != null){
		makeGem();
		nextGem = clock.getElapsedTime() + .2;
	}

	// Rotate Tower

	//gemTower.rotation.y += .01;

	// Utility

	TWEEN.update();
	requestAnimationFrame( animate );
	render();

}

function render() {

	controls.update();
	renderer.render( scene, camera );

}