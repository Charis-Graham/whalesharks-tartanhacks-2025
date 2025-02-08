import * as THREE from 'three';
import { MapControls } from 'three/addons/controls/MapControls.js';
import { Hex } from './hex.js';
import { OutlineEffect } from 'three/addons/effects/OutlineEffect.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

let renderer = new THREE.WebGLRenderer({antialias: true, alpha: true });
renderer.setClearColor(0xFFFFFF, 1);
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );
let effect = new OutlineEffect( renderer );


const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );

const controls = new MapControls( camera, renderer.domElement );
controls.enableDamping = true;

camera.position.y = 40;
camera.lookAt(0, 0, 0);
camera.position.z = 40;


const hex = new Hex(material);
const hexMesh = hex.generateHexGrid();
scene.add(hexMesh);

function animate() {
    
    controls.update();

	effect.render( scene, camera );

}