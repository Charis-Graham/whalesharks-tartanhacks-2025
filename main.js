import * as THREE from 'three';
import { MapControls } from 'three/addons/controls/MapControls.js';
import { HexWorld } from './hex-world.js';
import { OutlineEffect } from 'three/addons/effects/OutlineEffect.js';


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

let renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setClearColor(0xffffff, 1);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const effect = new OutlineEffect(renderer, {
    defaultColor: [1.0, 1.0, 1.0],
  });


// const material = new THREE.MeshBasicMaterial( { color: 0x6ee2ff } );
let pixelRatio = renderer.getPixelRatio();
const material = new THREE.ShaderMaterial({
    uniforms: {
        color: { value: new THREE.Color('rgb(110, 226, 255)') },
        alpha: { value: 0.5 },
        near: {value: camera.near },
        far: {value: camera.far },
        // resolution: { value: new THREE.Vector2(window.innerWidth*pixelRatio, window.innerHeight*pixelRatio) }
    },
    // attributes: {
        
    // },
    // color: 0x6ee2ff, 
    transparent: true, 
    blending: THREE.NormalBlending,
    // opacity: 0.5,
    fragmentShader: `
    uniform vec3 color;
    uniform float alpha, near, far;
    // uniform vec2 resolution;
    void main() {

        // vec2 uv = gl_FragCoord.xy / resolution; 
        // eye depth:
        // https://discourse.threejs.org/t/get-depth-in-fragment-shader/1831/3
        // https://codesandbox.io/p/sandbox/gojcn?file=%2Fsrc%2Findex.js%3A164%2C26-164%2C32
        // float fragDepth = (2.0 * near * far) / (far + near - gl_FragCoord.z * (far - near));
        // float foamness = 1.0 - clamp(linearDepth, 0.0, 1.0);

        gl_FragColor.rgb = color;
        // gl_FragColor.rgb += foamness * vec3(1.0, 1.0, 1.0);
        gl_FragColor.a = alpha;
        // gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0); // test with green
    }
    `
});

console.log(material.uniforms.color.value); 

const controls = new MapControls( camera, renderer.domElement );
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
const water = material; // new THREE.MeshPhongMaterial({ color: 0x0000ff , flatShading : true});


// const hexWorld = new HexWorld(land, true);
// hexWorld.generateHexGrid(8, 8, 1);
// const tileMeshes = hexWorld.getTileMeshes();
// tileMeshes.forEach(mesh => scene.add(mesh));

const waterWorld = new HexWorld(water, false);
waterWorld.generateHexGrid(8, 8, 1);
const waterMeshes = waterWorld.getTileMeshes();
waterMeshes.forEach(mesh => scene.add(mesh));





renderer.setAnimationLoop(animate);

// add light
// const light = new THREE.AmbientLight(); // soft white light
// scene.add( light );

// add cube to test depth
// const geometry = new THREE.BoxGeometry( 1, 1, 1 );
// const cubeMaterial = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
// const cube = new THREE.Mesh( geometry, cubeMaterial );
// scene.add( cube );

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
