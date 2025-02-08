import * as THREE from 'three';
import { MapControls } from 'three/addons/controls/MapControls.js';
import { HexWorld } from './hex-world.js';
import { OutlineEffect } from 'three/addons/effects/OutlineEffect.js';
import { CustomMaterials } from './materials.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

let renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setClearColor(0x000000, 0);
renderer.setSize(window.innerWidth, window.innerHeight);
//renderer.shadowMap.enabled = true;

document.body.appendChild(renderer.domElement);
const effect = new OutlineEffect(renderer, {
  defaultColor: [0,0,0],
});

// water shader
// const material = new THREE.MeshBasicMaterial( { color: 0x6ee2ff } );
let pixelRatio = renderer.getPixelRatio();
let waterColor = new THREE.Color('rgb(110, 226, 255)');
const transparentWaterShader = new THREE.ShaderMaterial({
    uniforms: {
        color: { value: waterColor },
        alpha: { value: 0.5 },
    },
    transparent: true, 
    blending: THREE.NormalBlending,
    fragmentShader: `
    uniform vec3 color;
    uniform float alpha;
    void main() {
        gl_FragColor.rgb = color;
        gl_FragColor.a = alpha;
    }
    `
});



// ! start new code from Clytie
let materialMaker = new CustomMaterials(camera, renderer, CustomMaterials.water_fragmentShader);
// & stuff I used for testing perlin texture
// let perlinTexture = new THREE.TextureLoader().load('textures/perlin.png');
// perlinTexture.encoding = THREE.sRGBEncoding;
// let white = new THREE.Color("white");
// let black = new THREE.Color("black");
// const waterShader = new THREE.MeshStandardMaterial({color:waterColor, map: perlinTexture, flatShading: true,});
// & trying to get perlin foam on the water correctly
materialMaker.vertexShader = CustomMaterials.water_vertexShader;
const waterShader = materialMaker.instantiateShaderMaterial();
// ! end new code from Clytie

// dirt texture material
// const dirtTexture = new THREE.TextureLoader().load( "textures/dirt_ground_texture__tileable___2048x2048__by_fabooguy_d7aopi7-414w-2x.jpg" );
// const dirtTexture = new THREE.TextureLoader().load( "textures/saturated_dirt.JPG" );
const dirtTexture = new THREE.TextureLoader().load("textures/unsaturated dirt.JPG");
// credit for original texture: https://www.deviantart.com/fabooguy/art/Dirt-Ground-Texture-Tileable-2048x2048-441212191
dirtTexture.encoding = THREE.sRGBEncoding;

// dirtTexture.wrapS = THREE.RepeatWrapping;
// dirtTexture.wrapT = THREE.RepeatWrapping;
// dirtTexture.repeat.set( 4, 4 );


let dirtColor = new THREE.Color('rgb(255, 250, 241)');
let grassColor = new THREE.Color('rgb(158, 235, 161)');
let treeColor = new THREE.Color('rgb(77, 202, 164)');
let rockColor = new THREE.Color('rgb(177, 183, 183)');
const dirtMaterial = new THREE.MeshStandardMaterial({ color: dirtColor, map: dirtTexture, flatShading: true, });
const grassMaterial = new THREE.MeshStandardMaterial({ color: grassColor, map: dirtTexture, flatShading: true, });
const rockMaterial = new THREE.MeshStandardMaterial({ color: rockColor, map: dirtTexture, flatShading: true, });
const treeMaterial = new THREE.MeshStandardMaterial({ color: treeColor, map: dirtTexture, flatShading: true, });



const controls = new MapControls(camera, renderer.domElement);
controls.enableDamping = true;


const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
document.addEventListener('mousemove', onPointerMove, false);
function onPointerMove(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
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
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  raycaster.layers.set(0);
  const intersects = raycaster.intersectObjects(scene.children, false);
  for (let i = 0; i < intersects.length; i++) {
    const intersectedObject = intersects[i].object;
    const tile = intersectedObject.userData.tile;
    if (tile && tile.land) {

      if (modeSelection == 'painting') {
        let selectedMaterial = null;
        if (colorMode == 0) {
          selectedMaterial = rockMaterial;
        } else if (colorMode == 1) {
          selectedMaterial = grassMaterial;
        } else if (colorMode == 2) {
          selectedMaterial = dirtMaterial;
        }
        tile.setMaterial(selectedMaterial);
      } else if (modeSelection == 'decorate') {
        tile.setTreeVisible();
      } else if (modeSelection == 'landscape') {
        tile.setHeight(((tile.getHeight + .5) % 9) + 1);
      }
      break;
    }
  }
}


//*
const loader = new FBXLoader();

let treeModel = null;
loader.load(
  '/models/tree.fbx',
  (object) => {
    // Prepare the tree model
    object.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.material[1] = treeMaterial;
        child.material[0] = dirtMaterial;
        child.material[0].needsUpdate = true;
        child.material[1].needsUpdate = true;
      }
    });
    object.scale.set(0.01, 0.01, 0.01);

    // Save the loaded tree model for later use
    treeModel = object;

    // Now add a tree to each hex tile (if the hex grid is already generated)
    addTreesToHexes();
  },
  (xhr) => {
    console.log(`FBX model ${(xhr.loaded / xhr.total) * 100}% loaded`);
  },
  (error) => {
    console.error('An error occurred while loading the FBX file:', error);
  }
);




camera.position.set(0, 40, 40);
camera.lookAt(0, 0, 0);

const ambientLight = new THREE.AmbientLight(0xedd9c2, 1);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xedd9c2, 3);
dirLight.position.set(100, 100, 100);
scene.add(dirLight);


const land = dirtMaterial; // new THREE.MeshPhongMaterial({ color: 0x00ff00 , flatShading : true});
const water = waterShader; // new THREE.MeshPhongMaterial({ color: 0x0000ff , flatShading : true});


hexWorld = new HexWorld(rockMaterial, true, false);
hexWorld.generateHexGrid(16, 16, 0);
const tileMeshes = hexWorld.getTileMeshes();
tileMeshes.forEach(mesh => scene.add(mesh));

addTreesToHexes();
function addTreesToHexes() {
  if (!treeModel) return;

  const treesGroup = new THREE.Group();
  hexWorld.tiles.forEach(tile => {
    if (tile.land) {
      const treeClone = treeModel.clone(true);
      treeClone.layers.set(1);

      treeClone.position.set(
        tile.position2D.x,
        tile.height,
        tile.position2D.y
      );

      tile.tree = treeClone;
      tile.tree.visible = false;

      treesGroup.add(treeClone);
    }
  });
  scene.add(treesGroup);
}


sea = new THREE.Mesh(
  new THREE.CylinderGeometry(20,20,.3,50),
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
const scene1 = new THREE.Scene();;
scene1.add(sea);


renderer.setAnimationLoop(animate);


let intersect = null;
let i = 0;

function animate() {
  waterShader.uniforms.time.value = performance.now() / 1000;
  controls.update();
  i += 1;

  if (!(modeIsClick) && i % 8 == 0) {
    raycaster.setFromCamera(pointer, camera);
    raycaster.layers.set(0);

    const intersects = raycaster.intersectObjects(scene.children, false);
    for (let i = 0; i < intersects.length; i++) {
      const intersectedObject = intersects[i].object;
      const tile = intersectedObject.userData.tile;
      if (tile && tile.land) {

        if (modeSelection == 'painting') {
          let selectedMaterial = null;
          if (colorMode == 0) {
            selectedMaterial = rockMaterial;
          } else if (colorMode == 1) {
            selectedMaterial = grassMaterial;
          } else if (colorMode == 2) {
            selectedMaterial = dirtMaterial;
          }
          tile.setMaterial(selectedMaterial);
        } else if (modeSelection == 'decorate') {
          tile.setTreeVisible();
        } else if (modeSelection == 'landscape') {
          tile.setHeight(((tile.getHeight + .5) % 9) + 1);
        }
        break;
      }
    }
  }

  if (drawBorder) {
    effect.render(scene, camera);
  } else {
    renderer.render(scene, camera);
  }
  renderer.autoClear = false;
  renderer.render(scene1, camera); // render water without postprocessing either way
  renderer.autoClear = true;  

}

