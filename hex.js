import * as THREE from 'three';

export class Hex {
  constructor({ i, j, position, material, height = 3 , land = true}) {
    this.i = i;
    this.j = j;
    this.position2D = position.clone();
    this.material = material;
    this.height = height;
    this.land = land;
    

    this.extra = null

    this.geometry = new THREE.CylinderGeometry(1, 1, this.height, 6, 1, false);
    this.geometry.translate(this.position2D.x, this.height * 0.5, this.position2D.y);

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.layers.set(0);
    this.mesh.userData.tile = this;
  }

  get object3D() {
    return this.mesh;
  }

  get getHeight () {
    return this.height;
  }

  get getLand () {
    return this.land;
  }

  setHeight(newHeight) {
    this.height = newHeight;
    this.geometry.dispose();

    this.geometry = new THREE.CylinderGeometry(1, 1, this.height, 6, 1, false);
    this.geometry.translate(this.position2D.x, this.height * 0.5, this.position2D.y);

    
    if (this.tree) {

      this.tree.position.set(
        this.position2D.x,
        this.height,
        this.position2D.y
      );
      this.tree.visible = false;
    }

    this.mesh.geometry = this.geometry;
  }
  
}
