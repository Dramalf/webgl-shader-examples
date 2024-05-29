"use client";
import React, { useEffect } from 'react'
import * as dat from 'dat.gui';
import Stats from 'stats.js';
import './index.css'

export default function Cloud() {
  useEffect(() => {
    init()
  }, [])
  async function init() {
    const gui = new dat.GUI();
    const settings = {
      speed: 0.01,
      cloudScale:1.1
      // 其他参数
    };
    gui.add(settings, 'speed', 0.005, 0.3);
    gui.add(settings, 'cloudScale', 1, 5);

    const script = document.createElement('script');
    await new Promise(resolve => {
      script.onload = resolve;
      script.src = '/webgl-utils.js'
      document.head.appendChild(script);
    })
    let stats = new Stats();

    stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    dat
    document.body.appendChild(stats.dom);
    /** @type {HTMLCanvasElement} */
    const canvas = document.getElementById('c');
    const gl = canvas.getContext('webgl2');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (!gl) {
      alert('无法初始化WebGL，你的浏览器可能不支持。');
    }
    const vertexShaderSource = await fetch('/cloud/vertex.glsl').then(res => res.text());
    const fragmentShaderSource = await fetch('/cloud/fragment.glsl').then(res => res.text());


    var program = webglUtils.createProgramFromSources(gl, [vertexShaderSource, fragmentShaderSource]);
    var positionAttributeLocation = gl.getAttribLocation(program, "a_position");

    var iTimeUniformLocation = gl.getUniformLocation(program, 'iTime');
    var speedUniformLocation = gl.getUniformLocation(program, 'speed');
    var cloudScaleUniformLocation = gl.getUniformLocation(program, 'cloudscale');

    // look up uniform locations
    var resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");

    // Create a buffer and put a single pixel space rectangle in
    // it (2 triangles)
    // Create a buffer and put three 2d clip space points in it
    var positionBuffer = gl.createBuffer();

    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    var positions = [
      0, 0,
      0, gl.canvas.height,
      gl.canvas.width, 0,

      gl.canvas.width, 0,
      0, gl.canvas.height,
      gl.canvas.width, gl.canvas.height
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    // Create a vertex array object (attribute state)
    var vao = gl.createVertexArray();

    // and make it the one we're currently working with
    gl.bindVertexArray(vao);

    // Turn on the attribute
    gl.enableVertexAttribArray(positionAttributeLocation);

    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 2;          // 2 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
      positionAttributeLocation, size, type, normalize, stride, offset);

    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // Bind the attribute/buffer set we want.
    gl.bindVertexArray(vao);

    // Pass in the canvas resolution so we can convert from
    // pixels to clipspace in the shader
    var iTimeUniformLocation = gl.getUniformLocation(program, 'iTime');

    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
    gl.uniform1f(iTimeUniformLocation, 0.0);
    gl.uniform1f(speedUniformLocation,settings.speed);
    gl.uniform1f(cloudScaleUniformLocation, settings.cloudScale);

    
    // draw
    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 6;
    window.addEventListener('resize',()=>{
      gl.canvas.width=window.innerWidth;
      gl.canvas.height=window.innerHeight;

    })
    function render(time) {
      stats.begin()
      gl.useProgram(program);

      time *= 0.001; // 转换到秒
      gl.uniform1f(speedUniformLocation, settings.speed);
      gl.uniform1f(cloudScaleUniformLocation, settings.cloudScale);

      gl.uniform1f(iTimeUniformLocation, time); // 更新时间
      // 绘制场景（此处需要根据具体的顶点数据等来设定）
      gl.drawArrays(primitiveType, offset, count);

      stats.end()
      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
  }
  return (
    <div className='page-wrapper'><canvas id="c" /></div>
  )
}
