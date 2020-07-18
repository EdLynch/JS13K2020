'use strict';

// Abstraction over common controls for user interaction with a 3D scene
class Controls {

  constructor(camera, canvas) {
    this.camera = camera;
    this.canvas = canvas;
    this.picker = null;

    this.dragging = false;
    this.picking = false;

    this.x = 0;
    this.y = 0;
    this.lastX = 0;
    this.lastY = 0;
    this.button = 0;

    this.dloc = 0;
    this.dstep = 0;
    this.motionFactor = 10;

    canvas.onmousedown = event => this.onMouseDown(event);
    canvas.onmouseup = event => this.onMouseUp(event);
    canvas.onmousemove = event => this.onMouseMove(event);
  }

  // Sets picker for picking objects
  setPicker(picker) {
    this.picker = picker;
  }

  // Returns 3D coordinates
  get2DCoords(event) {
    let top = 0,
      left = 0,
      canvas = this.canvas;

    while (canvas && canvas.tagName !== 'BODY') {
      top += canvas.offsetTop;
      left += canvas.offsetLeft;
      canvas = canvas.offsetParent;
    }

    left += window.pageXOffset;
    top -= window.pageYOffset;

    return {
      x: event.clientX - left,
      y: this.canvas.height - (event.clientY - top)
    };
  }

  onMouseUp(event) {
    this.dragging = false;
  }

  onMouseDown(event) {
    this.dragging = true;

    this.x = event.clientX;
    this.y = event.clientY;
    this.button = event.button;

    this.dstep = Math.max(this.camera.position[0], this.camera.position[1], this.camera.position[2]) / 100;

    if (!this.picker) return;

    const coordinates = this.get2DCoords(event);
    this.picking = this.picker.find(coordinates);

    if (!this.picking) this.picker.stop();
  }

  onMouseMove(event) {
    this.lastX = this.x;
    this.lastY = this.y;

    this.x = event.clientX;
    this.y = event.clientY;

    if (!this.dragging) return;


    const dx = this.x - this.lastX;
    const dy = this.y - this.lastY;

    if (this.picking && this.picker.moveCallback) {
      this.picker.moveCallback(dx, dy);
      return;
    }

   this.rotate(dx, dy);
  }


  rotate(dx, dy) {
    const { width, height } = this.canvas;

    const deltaAzimuth = -20 / width;
    const deltaElevation = -20 / height;

    const azimuth = dx * deltaAzimuth * this.motionFactor;
    const elevation = dy * deltaElevation * this.motionFactor;

    this.camera.changeAzimuth(azimuth);
    this.camera.changeElevation(elevation);
  }

}