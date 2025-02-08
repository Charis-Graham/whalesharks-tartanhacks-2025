import * as THREE from 'three';
import { createNoise2D } from 'https://cdn.skypack.dev/simplex-noise';

// perlin noise texture generated from: http://eastfarthing.com/blog/2015-04-21-noise/
let perlinTexture = new THREE.TextureLoader().load('textures/perlin.png');
perlinTexture.wrapS = THREE.RepeatWrapping;
perlinTexture.wrapT = THREE.RepeatWrapping;
// perlinTexture.repeat.set( 4, 4 );

// https://www.manytextures.com/texture/44/clear-sea-water/
let waterTex = new THREE.TextureLoader().load('textures/clear-sea-water-2048x2048.jpg');
waterTex.wrapS = THREE.RepeatWrapping;
waterTex.wrapT = THREE.RepeatWrapping;

export class CustomMaterials{
    static waterSimple_fragmentShader = `
    uniform vec3 color;
    uniform float alpha;
    void main() {
        gl_FragColor.rgb = color;
        gl_FragColor.a = alpha;
    }
    `;
    static water_fragmentShader = `
        uniform vec3 color;
        uniform vec3 foamColor;
        uniform float alpha, near, far;
        uniform sampler2D waterNoise;
        uniform vec2 resolution;
        float repeatFactor = 4.;
        float foamFactor = 0.5;

        // to go with gpt vertex shader code
        in vec2 vUv;
        // out vec4 FragColor;
        // end gpt code

        void main() {

            // texture sampling from gpt
            // Texture coordinates go beyond [0,1] to repeat the texture
            vec2 repeatedTexCoord = mod(vUv*repeatFactor, 1.0);  // This ensures texture repeats
            vec3 perlinSample = texture(waterNoise, repeatedTexCoord).rgb;
            float perlinLuminosity = dot(perlinSample, vec3(0.299, 0.587, 0.114));
            vec3 foam = clamp(perlinLuminosity, 0., 1.0) * foamColor * foamFactor;  // Sample the texture
            // vec3 foam = perlinSample * foamColor; // without using luminosity
            // end gpt code
    
            vec2 uv = gl_FragCoord.xy / resolution; 
            // eye depth:
            // https://discourse.threejs.org/t/get-depth-in-fragment-shader/1831/3
            // https://codesandbox.io/p/sandbox/gojcn?file=%2Fsrc%2Findex.js%3A164%2C26-164%2C32
            // float fragDepth = (2.0 * near * far) / (far + near - gl_FragCoord.z * (far - near));
            // float foamness = 1.0 - clamp(linearDepth, 0.0, 1.0);
            // ? vec4 foam_edge = SOMETHING SOMETHING with the resolution;
    
            gl_FragColor.rgb = color;
            gl_FragColor.rgb += foam;
            // gl_FragColor.rgb += foamness * vec3(1.0, 1.0, 1.0);
            gl_FragColor.a = alpha;
            // gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0); // test with green
        }
        `;
        // water_vertexShader = ` // trying chatGPT's vertexshader for UV in fragment shader
        // layout(location = 0) in vec2 aPosition;
        // layout(location = 1) in vec2 aTexCoord;

        // varying vec2 vTexCoord;

        // void main() {
        //     gl_Position = vec4(aPosition, 0.0, 1.0);
        //     vTexCoord = aTexCoord;  // Pass texture coordinates to fragment shader
        // }
        // `;
    static water_vertexShader = ` // other gpt version
        // layout(location = 0) in vec3 position;  // Vertex position
        // layout(location = 1) in vec2 uv;  // Built-in UV coordinates attribute

        out vec2 vUv;
        void main() {
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);  // Standard position calculation
            vUv = uv;  // Pass the built-in 'uv' attribute to the fragment shader
        }
        `;
    static perlin = perlinTexture;
    static water = waterTex;

    constructor(camera, renderer, fragmentShader) {
        this.pixelRatio = renderer.getPixelRatio();
        this.uniforms =  {
            color: { value: new THREE.Color('rgb(35, 141, 255)') },
            // color: { value: new THREE.Color('rgb(192, 248, 255)')},
            foamColor: { value: new THREE.Color('rgb(255, 255, 255)') } ,
            // color: {value : new THREE.Color('black') },
            alpha: { value: 0.5 },
            near: {value: camera.near },
            far: {value: camera.far },
            waterNoise: {value: CustomMaterials.water},
            perlinNoise: {value: CustomMaterials.perlin},
            resolution: { value: new THREE.Vector2(window.innerWidth*this.pixelRatio, window.innerHeight*this.pixelRatio) }
        };
        this.transparent = true;
        this.blending =  THREE.NormalBlending;
        this.fragmentShader = fragmentShader;
        this.vertexShader = THREE.ShaderLib["basic"].vertexShader;
    }

    instantiateShaderMaterial () {
        return new THREE.ShaderMaterial({ 
            uniforms: this.uniforms, 
            transparent: this.transparent, 
            blending: this.blending, 
            fragmentShader: this.fragmentShader,
            vertexShader: this.vertexShader
         });
    }
}