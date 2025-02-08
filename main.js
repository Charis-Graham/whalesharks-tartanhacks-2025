import * as THREE from 'three';
import { MapControls } from 'three/addons/controls/MapControls.js';
import { HexWorld } from './hex-world.js';
import { OutlineEffect } from 'three/addons/effects/OutlineEffect.js';


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75, 
  window.innerWidth / window.innerHeight, 
  0.1, 
  1000
);


let renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setClearColor(0xffffff, 1);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const effect = new OutlineEffect(renderer, {
    defaultColor: [1.0, 1.0, 1.0],
  });


const controls = new MapControls(camera, renderer.domElement);
controls.enableDamping = true;


const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
document.addEventListener('mousemove', onPointerMove, false);


window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

document.addEventListener('click', onClick, false);
function onClick(event) {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(scene.children, false);
    if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;

        const tile = intersectedObject.userData.tile;
        if (tile && tile.land) tile.setHeight(tile.getHeight+1);
    }
}


camera.position.set(0, 40, 40);
camera.lookAt(0, 0, 0);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
dirLight.position.set(100, 100, 100);
scene.add(dirLight);


const land = new THREE.MeshPhongMaterial({ color: 0x00ff00 , flatShading : true});
const water = new THREE.MeshPhongMaterial({ color: 0x0000ff , flatShading : true});


const hexWorld = new HexWorld(land, true);
hexWorld.generateHexGrid(8, 8, 1);
const tileMeshes = hexWorld.getTileMeshes();
tileMeshes.forEach(mesh => scene.add(mesh));

const waterWorld = new HexWorld(water, false);
waterWorld.generateHexGrid(8, 8, 1);
const waterMeshes = waterWorld.getTileMeshes();
waterMeshes.forEach(mesh => scene.add(mesh));



renderer.setAnimationLoop(animate);

function animate() {
  controls.update();

    /*
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(scene.children, false);

  if (intersects.length > 0) {
    const intersectedObject = intersects[0].object;
    const tile = intersectedObject.userData.tile; 
    if (tile) {
      tile.setHeight(5); // or any new height
    }
  } else {
    if (intersect) {
      intersect.material.emissive.setHex(intersect.currentHex);
      intersect = null;
    }
  }*/

  effect.render(scene, camera);
}


function onPointerMove(event) {
  pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}
