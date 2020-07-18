
    'use strict';

    let
      gl,
      program,
      indices,
      scene,
      sphereVAO,
      camera,
      sphereIndicesBuffer,
      lightDiffuseColor = [1, 1, 1],
      lightDirection = [0, 2, -1],
      sphereColor = [0.5, 0.9, 0.1],
      modelViewMatrix = mat4.create(),
      projectionMatrix = mat4.create(),
      normalMatrix = mat4.create(),
      objects = [],
      pos=0,
      dx= .1,
      transforms;

    function initProgram() {
      // Configure `canvas`
      const canvas = utils.getCanvas('webgl-canvas');
      utils.autoResizeCanvas(canvas);

      // Configure `gl` context
      gl = utils.getGLContext(canvas);
      gl.clearColor(0.9, 0.9, 0.9, 1);
      gl.enable(gl.DEPTH_TEST);

      // Shader source
      const vertexShader = utils.getShader(gl, 'vertex-shader');
      const fragmentShader = utils.getShader(gl, 'fragment-shader');

      // configure our `program`
      program = gl.createProgram();
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Could not initialize shaders');
      }

      gl.useProgram(program);

      // Set locations onto the `program` instance
      program.aVertexPosition = gl.getAttribLocation(program, 'aVertexPosition');
      program.aVertexNormal = gl.getAttribLocation(program, 'aVertexNormal');
      program.uProjectionMatrix = gl.getUniformLocation(program, 'uProjectionMatrix');
      program.uModelViewMatrix = gl.getUniformLocation(program, 'uModelViewMatrix');
      program.uNormalMatrix = gl.getUniformLocation(program, 'uNormalMatrix');
      program.uMaterialDiffuse = gl.getUniformLocation(program, 'uMaterialDiffuse');
      program.uLightDiffuse = gl.getUniformLocation(program, 'uLightDiffuse');
      program.uLightDirection = gl.getUniformLocation(program, 'uLightDirection');

      
      scene = new Scene(gl, program);

      // Configure `camera` and set it to be in tracking mode
      camera = new Camera();
      camera.goHome([0, 2, 30]);

      // Configure controls by allowing user driven events to move camera around
      new Controls(camera, canvas);

      transforms = new Transforms(gl, program, camera, canvas);
    }

    function initLights() {
      gl.uniform3fv(program.uLightDirection, lightDirection);
      gl.uniform3fv(program.uLightDiffuse, lightDiffuseColor);
    }

    // Set the matrix uniforms
    function setMatrixUniforms() {
      gl.uniformMatrix4fv(program.uModelViewMatrix, false, camera.getViewTransform());
      gl.uniformMatrix4fv(program.uProjectionMatrix, false, projectionMatrix);
      mat4.transpose(normalMatrix, camera.matrix);
      gl.uniformMatrix4fv(program.uNormalMatrix, false, normalMatrix);
    }

    function initBuffers() {
      scene.add(cube(), {alias:'cube', transform: [2, 0, 2]})
      scene.add(cube(), {alias:'cube', transform: [0, 0, 0]})
      scene.add(cube(), {alias:'cube', transform: [-2, 0, -2]})
    }

    function draw() {
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      // We will discuss these operations in later chapters
      mat4.perspective(projectionMatrix, 45, gl.canvas.width / gl.canvas.height, 0.1, 10000);

      transforms.updatePerspective();

      // We will start using the `try/catch` to capture any errors from our `draw` calls
      try {
        setMatrixUniforms();
        // Iterate over every object in the scene
        scene.traverse(object => {
          transforms.calculateModelView();
          transforms.push();

          if (object.alias === 'cube') {
            const sphereTransform = transforms.modelViewMatrix;
            const loc = [...object.transform]
            loc[2] += pos
            mat4.translate(sphereTransform, sphereTransform, loc);
          }

          transforms.setMatrixUniforms();
          transforms.pop();

          // Bind

          gl.uniform3fv(program.uMaterialDiffuse, object.diffuse);
          gl.uniform1i(program.uWireframe, object.wireframe);

          gl.bindVertexArray(object.vao);
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object.ibo);
 
          // Draw
          if (object.wireframe) {
            gl.drawElements(gl.LINES, object.indices.length, gl.UNSIGNED_SHORT, 0);
          }
          else {
            gl.drawElements(gl.TRIANGLES, object.indices.length, gl.UNSIGNED_SHORT, 0);
          }

          // Clean
          gl.bindVertexArray(null);
          gl.bindBuffer(gl.ARRAY_BUFFER, null);
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        });
      }
      // We catch the `error` and simply output to the screen for testing/debugging purposes
      catch (error) {
        console.error(error);
      }
    }

    
    // Update object positions
    function animate() {
      pos += dx;

      if (pos >= 10 || pos <= -10) {
        dx = -dx;
      }
      draw();
    }

    function render() {
      requestAnimationFrame(render);
      animate();
      draw();
    }

    function init() {
      initProgram();
      initBuffers();
      initLights();
      render();
    }

    window.onload = init;