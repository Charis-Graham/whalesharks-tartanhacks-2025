import * as THREE from 'three';
import { Hex } from './hex.js';

export class HexWorld {
  constructor(defaultMaterial, land) {
    this.defaultMaterial = defaultMaterial; 
    this.tiles = [];
    this.land = land
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

  generateHexGrid(range = 4, maxDistance = 16, height = 2) {
    for (let i = -range; i <= range; i++) {
      for (let j = -range; j <= range; j++) {
        const position = this.tileToPosition(i, j);
        if (position.length() > maxDistance) continue;
        const tileMaterial = this.defaultMaterial.clone();


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
