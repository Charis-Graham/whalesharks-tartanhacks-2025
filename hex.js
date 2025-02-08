import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

export class Hex {
    constructor(material) {
        this.material = material;
        this.hexagonalGeometries = new THREE.BoxGeometry(0, 0, 0);
    }

    tileToPosition(tileX, tileY) {
        return new THREE.Vector2(
            (tileX + (tileY % 2) * 0.5) * 1.77,
            tileY * 1.535
        );
    }

    hexGeometry(height, position) {
        const geo = new THREE.CylinderGeometry(1, 1, height, 6, 1, false);
        geo.translate(position.x, height * 0.5, position.y);
        return geo;
    }

    makeHex(height, position) {
        const geo = this.hexGeometry(height, position);
        this.hexagonalGeometries = BufferGeometryUtils.mergeGeometries([
            this.hexagonalGeometries,
            geo
        ]);
    }

    generateHexGrid(range = 10, maxDistance = 16, height = 3) {
        for (let i = -range; i <= range; i++) {
            for (let j = -range; j <= range; j++) {
                const position = this.tileToPosition(i, j);
                if (position.length() > maxDistance) continue;
                this.makeHex(height, position);
            }
        }
        
        return new THREE.Mesh(this.hexagonalGeometries, this.material);
    }
}
