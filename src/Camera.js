'use strict';

// Abstraction over constructing and interacting with a 3D scene using a camera
class Camera {

  constructor() {
    this.position = vec3.create();
    this.focus = vec3.create();
    this.home = vec3.create();

    this.up = vec3.create();
    this.right = vec3.create();
    this.normal = vec3.create();

    this.matrix = mat4.create();

    // You could have these options be passed in via the constructor
    // or allow the consumer to change them directly
    this.steps = 0;
    this.azimuth = 0;
    this.elevation = 0;
    this.fov = 45;
    this.minZ = 0.1;
    this.maxZ = 10000;
  }


  // Position the camera back home
  goHome(home) {
    if (home) {
      this.home = home;
    }

    this.setPosition(this.home);
    this.setAzimuth(0);
    this.setElevation(0);
  }


  // Change camera position
  setPosition(position) {
    vec3.copy(this.position, position);
    this.update();
  }

  // Change camera focus
  setFocus(focus) {
    vec3.copy(this.focus, focus);
    this.update();
  }

  // Set camera azimuth
  setAzimuth(azimuth) {
    this.changeAzimuth(azimuth - this.azimuth);
  }

  // Change camera azimuth
  changeAzimuth(azimuth) {
    this.azimuth += azimuth;

    if (this.azimuth > 360 || this.azimuth < -360) {
      this.azimuth = this.azimuth % 360;
    }

    this.update();
  }

  // Set camera elevation
  setElevation(elevation) {
    this.changeElevation(elevation - this.elevation);
  }

  // Change camera elevation
  changeElevation(elevation) {
    this.elevation += elevation;

    if (this.elevation > 360 || this.elevation < -360) {
      this.elevation = this.elevation % 360;
    }

    this.update();
  }

  // Update the camera orientation
  calculateOrientation() {
    const right = vec4.create();
    vec4.set(right, 1, 0, 0, 0);
    vec4.transformMat4(right, right, this.matrix);
    vec3.copy(this.right, right);

    const up = vec4.create();
    vec4.set(up, 0, 1, 0, 0);
    vec4.transformMat4(up, up, this.matrix);
    vec3.copy(this.up, up);

    const normal = vec4.create();
    vec4.set(normal, 0, 0, 1, 0);
    vec4.transformMat4(normal, normal, this.matrix);
    vec3.copy(this.normal, normal);
  }

  // Update camera values
  update() {
    mat4.identity(this.matrix);

    mat4.rotateY(this.matrix, this.matrix, this.azimuth * Math.PI / 180);
    mat4.rotateX(this.matrix, this.matrix, this.elevation * Math.PI / 180);
    mat4.translate(this.matrix, this.matrix, this.position);

    this.calculateOrientation();
  }

  // Returns the view transform
  getViewTransform() {
    const matrix = mat4.create();
    mat4.invert(matrix, this.matrix);
    return matrix;
  }

}
