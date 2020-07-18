'use strict';

// Manages objects in a 3D scene
class Scene {

  constructor(gl, program) {
    this.gl = gl;
    this.program = program;

    this.objects = [];
  }

  // Find the item with given alias
  get(alias) {
    return this.objects.find(object => object.alias === alias);
  }


  // Add object to scene, by settings default and configuring all necessary
  // buffers and textures
  add(object, attributes,) {
    const { gl, program } = this;

    // Since we've used both the OBJ convention here (e.g. Ka, Kd, Ks, etc.)
    // and descriptive terms throughout the book for educational purposes, we will set defaults for
    // each that doesn't exist to ensure the entire series of demos work.
    // That being said, it's best to stick to one convention throughout your application.
    object.diffuse = object.diffuse || [1, 1, 1];
    object.Kd = object.Kd || object.diffuse.slice(0, 3)

    // Merge if any attributes are provided
    Object.assign(object, attributes);

    // Indices
    object.ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object.ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(object.indices), gl.STATIC_DRAW);

    // Attach a new VAO instance
    object.vao = gl.createVertexArray();

    // Enable it to start working on it
    gl.bindVertexArray(object.vao);

    // Positions
    if (program.aVertexPosition >= 0) {
      const vertexBufferObject = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(object.vertices), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(program.aVertexPosition);
      gl.vertexAttribPointer(program.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
    }

    // Normals
    if (program.aVertexNormal >= 0) {
      const normalBufferObject = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, normalBufferObject);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(
        utils.calculateNormals(object.vertices, object.indices)),
        gl.STATIC_DRAW
      );
      gl.enableVertexAttribArray(program.aVertexNormal);
      gl.vertexAttribPointer(program.aVertexNormal, 3, gl.FLOAT, false, 0, 0);
    }

    // Push to our objects list for later access
    this.objects.push(object);

    // Clean up
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }

  // Traverses over every item in the scene
  traverse(cb) {
    for(let i = 0; i < this.objects.length; i++) {
      // Break out of the loop as long as any value is returned
      if (cb(this.objects[i], i) !== undefined) break;
    }
  }

}