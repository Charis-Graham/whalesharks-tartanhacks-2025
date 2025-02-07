import * as THREE from 'three';
import { MapControls } from 'three/addons/controls/MapControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );


const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );

const controls = new MapControls( camera, renderer.domElement );
controls.enableDamping = true;

camera.position.z = 5;

function hexGeometry(height, position){
    let geo = new THREE.CylinderGeometry(1, 1, height, 6, 1, false);
    translate(position.x, height * 0.5, position.y);
    return geo;
}

function makeHex(height, position) {
    let geo = this.hexGeometry(height, position);
    hexagonalGeometries = BufferGeometryUtils.mergeGeometries([this.hexagonalGeometries, geo]);
}

function animate() {

	cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;
    controls.update();

	renderer.render( scene, camera );

}