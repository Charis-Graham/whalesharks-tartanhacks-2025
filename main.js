import * as THREE from 'three';
import { MapControls } from 'three/addons/controls/MapControls.js';
import { HexWorld } from './hex-world.js';
import { OutlineEffect } from 'three/addons/effects/OutlineEffect.js';


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

let renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setClearColor(0x000000, 0);
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);
const effect = new OutlineEffect(renderer, {
    defaultColor: [1.0, 1.0, 1.0],
  });

// water shader
// const material = new THREE.MeshBasicMaterial( { color: 0x6ee2ff } );
let pixelRatio = renderer.getPixelRatio();
const waterShader = new THREE.ShaderMaterial({
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

// dirt texture material
// const dirtTexture = new THREE.TextureLoader().load( "textures/dirt_ground_texture__tileable___2048x2048__by_fabooguy_d7aopi7-414w-2x.jpg" );
// const dirtTexture = new THREE.TextureLoader().load( "textures/saturated_dirt.JPG" );
const dirtTexture = new THREE.TextureLoader().load( "textures/unsaturated dirt.JPG" );
dirtTexture.encoding = THREE.sRGBEncoding;

// dirtTexture.wrapS = THREE.RepeatWrapping;
// dirtTexture.wrapT = THREE.RepeatWrapping;
// dirtTexture.repeat.set( 4, 4 );


let dirtColor = new THREE.Color('rgb(247, 190, 164)');
let grassColor = new THREE.Color('rgb(108, 229, 112)');
let rockColor = new THREE.Color('rgb(86, 86, 86)');
const dirtMaterial = new THREE.MeshStandardMaterial({color:dirtColor, map: dirtTexture, flatShading: true,});
const grassMaterial = new THREE.MeshStandardMaterial({color:grassColor, map: dirtTexture, flatShading: true,});
const rockMaterial = new THREE.MeshStandardMaterial({color:rockColor, map: dirtTexture, flatShading: true,});




const controls = new MapControls( camera, renderer.domElement );
controls.enableDamping = true;


const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
document.addEventListener('mousemove', onPointerMove, false);
function onPointerMove(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width)  * 2 - 1;
  pointer.y = -((event.clientY - rect.top)  / rect.height) * 2 + 1;
}


window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

document.addEventListener('click', onClick, false);
function onClick(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width)  * 2 - 1;
  pointer.y = -((event.clientY - rect.top)  / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(scene.children, false);
    for (let i = 0; i < intersects.length; i++) {
      const intersectedObject = intersects[i].object;
      const tile = intersectedObject.userData.tile;
      if (tile && tile.land) {
        tile.setHeight(((tile.getHeight + .5) % 9) + 1);
        break;
      }
    }
}



camera.position.set(0, 40, 40);
camera.lookAt(0, 0, 0);

const ambientLight = new THREE.AmbientLight(0xedd9c2, 1);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xedd9c2, 3);
dirLight.position.set(100, 100, 100);
scene.add(dirLight);


const land = dirtMaterial; // new THREE.MeshPhongMaterial({ color: 0x00ff00 , flatShading : true});
const water = waterShader; // new THREE.MeshPhongMaterial({ color: 0x0000ff , flatShading : true});


hexWorld = new HexWorld(land, true, false);
hexWorld.generateHexGrid(12, 12, 0);
const tileMeshes = hexWorld.getTileMeshes();
tileMeshes.forEach(mesh => scene.add(mesh));



sea = new THREE.Mesh(
  new THREE.CylinderGeometry(100,100,.1,50),
  waterShader
  /*new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('rgb(110, 226, 255)'),
    ior: 1.05,
    transmission: 1,
    transparent: true,
    roughness: 1,
    metalness: .0
  })*/
)

sea.position.set(0, 0, 0);
scene.add(sea);


renderer.setAnimationLoop(animate);


let intersect = null;
let i = 0;

function animate() {
  controls.update();
  i += 1;

  if (modeIsClick && i % 20 == 0){
    raycaster.setFromCamera(pointer, camera);

    const intersects = raycaster.intersectObjects(scene.children, false);
    for (let i = 0; i < intersects.length; i++) {
      const intersectedObject = intersects[i].object;
      const tile = intersectedObject.userData.tile;
      if (tile && tile.land) {
        tile.setHeight(((tile.getHeight + .5) % 9) + 1);
        break;
      }
    }
  }
  
  if (drawBorder){
    effect.render(scene, camera);
  } else {
    renderer.render(scene, camera);
  }
  
}

