import * as THREE from 'three';
import { createNoise2D } from 'https://cdn.skypack.dev/simplex-noise';
import { Hex } from './hex.js';

export class HexWorld {
  constructor(defaultMaterial, land, rand) {
    this.defaultMaterial = defaultMaterial; 
    this.tiles = [];
    this.land = land
    this.rand = rand
    this.noise2D = createNoise2D(Math.random);
    this.max = 9
    this.min = 1
    this.interval = .5
  }

  get onLand(){
    return this.land;
  }


  tileToPosition(tileX, tileY) {
    return new THREE.Vector2(
      (tileX + (tileY % 2) * 0.5) * 1.77,
      tileY * 1.535
    );
  }

  snapToInterval(x) {

    const clampedValue = Math.max(this.min, Math.min(x, this.max));
  
    const steps = Math.round((clampedValue - this.min) / this.interval);
    const snappedValue = this.min + steps * this.interval;
  
    return snappedValue;
  }

  generateRandom() {
    const frequency = 0.1;
    const amplitude = 5;
  
    for (const tile of this.tiles) {
      const noiseValue = this.noise2D(tileToPosition(tile.i, tile.j)[0] * frequency, tileToPosition(tile.i, tile.j)[1] * frequency);
      const newHeight = noiseValue * amplitude;
      tile.setHeight(this.snapToInterval(newHeight)); 
    }
  }

  generateHexGrid(range = 4, maxDistance = 16, height = 2) {
    for (let i = -range; i <= range; i++) {
      for (let j = -range; j <= range; j++) {
        const position = this.tileToPosition(i, j);
        if (position.length() > maxDistance) continue;
        const tileMaterial = this.defaultMaterial.clone();
        
        if (this.rand) {
          const frequency = 0.1;
          const amplitude = 4;
          const noiseValue = this.noise2D(i * frequency, j * frequency);
          const mountainHeight = noiseValue * amplitude;
          height = this.snapToInterval(Math.abs(mountainHeight));
        }

        const tile = new Hex({
          position,
          material: tileMaterial,
          height
        });

        this.tiles.push(tile);
      }
    }
    return this.tiles;
  }

  getTileMeshes() {
    return this.tiles.map(tile => tile.object3D);
  }
}
