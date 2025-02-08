import * as THREE from 'three';
import { createNoise2D } from 'https://cdn.skypack.dev/simplex-noise';
import { Hex } from './hex.js';

export class HexWorld {
  constructor(defaultMaterial, land, rand) {
    this.defaultMaterial = defaultMaterial; 
    this.tiles = [];
    this.land = land
    this.rand = rand
    this.noise2D = null; 
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

  resetHexGrid() {
    for (const tile of this.tiles) {
      
      tile.setHeight(0);
      tile.tree.visible = false;
      tile.setMaterial(this.defaultMaterial);
    }
  }

  generateRandom() {
    this.noise2D = createNoise2D(Math.random);
    const frequency = 0.1;
    const amplitude = 4;
    const off = 1;
  
    for (const tile of this.tiles) {
      const pos = this.tileToPosition(tile.i, tile.j);
      const noiseValue = this.noise2D((pos.x + off) * frequency, (pos.y + off) * frequency);
      const newHeight = noiseValue * amplitude;
      tile.setHeight(this.snapToInterval(newHeight + 5)); 
    }
  }

  generateHexGrid(range = 4, maxDistance = 16, height = 2) {
    this.noise2D = createNoise2D(Math.random);
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
          i,
          j,
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
