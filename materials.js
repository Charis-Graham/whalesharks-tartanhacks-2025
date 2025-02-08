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

let waveTex = new THREE.TextureLoader().load('textures/360_F_313465915_yKeoaVjyWw5X9zLYUtfi68qNtMM3VivJ.jpg');
waveTex.wrapS = THREE.RepeatWrapping;
waveTex.wrapT = THREE.RepeatWrapping;

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
        uniform float time;
        uniform sampler2D waveNoise;
        float repeatFactor = 1.;
        float waveAmplitude = 0.3;
        float waveFrequency = 3.;
        void main() {
            vUv = uv;  // Pass the built-in 'uv' attribute to the fragment shader
            // vUv = clamp(cos(uv), 0., 1.);
            vec3 perlinSample = texture(waveNoise, mod(uv*repeatFactor, 1.0)).rgb;
            float perlinLuminosity = dot(perlinSample, vec3(0.299, 0.587, 0.114));

            vec4 pos = projectionMatrix * modelViewMatrix * vec4(position, 1.0);  // Standard position calculation
            float r = length(pos); // 2D radius from center
            float weight = clamp(30.-r, 0., 30.)/30.;   
            weight = 1.;

            vec4 wave_offset = vec4(0.,
                                    // waveAmplitude*0.2*perlinLuminosity*cos(time*waveFrequency)*weight, 
                                    waveAmplitude*perlinLuminosity*sin(time*waveFrequency)*weight, 
                                    0., 
                                    0.);
            // wave_offset = vec4(0., 0., 0., 0.);

            gl_Position = pos + wave_offset;
        }
        `;
    static perlin = perlinTexture;
    static water = waterTex;
    static wave = waveTex;

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
            waveNoise: {value: CustomMaterials.perlin},
            // waveNoise: {value: CustomMaterials.wave},
            resolution: { value: new THREE.Vector2(window.innerWidth*this.pixelRatio, window.innerHeight*this.pixelRatio) },
            time: {value: 0. }
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