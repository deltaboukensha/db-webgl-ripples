import { Box, FormControlLabel, Slider, Switch } from "@mui/material";
import React, { useState } from "react";

const canvasWidth = 512;
const canvasHeight = 512;

const useWebGl = (initFunction, updateFunction, dependencies) => {
  const ref = React.useRef();

  React.useEffect(() => {
    console.log("init");
    initFunction(ref.current);
    return () => {};
  }, []);

  React.useEffect(() => {
    updateFunction(ref.current);
    return () => {};
  }, dependencies);

  return ref;
};

const initGame = async (canvas: HTMLCanvasElement) => {
  const gl = canvas.getContext("webgl2");

  if(!gl) throw "gl is not supported";

  const shaders = {
    quad_vert: null as WebGLShader | null,
    quad_frag: null as WebGLShader | null,
    render_frag: null as WebGLShader | null,
    water_frag: null as WebGLShader | null,
    peek_frag: null as WebGLShader | null,
    mouse_frag: null as WebGLShader | null,
  };

  const programs = {
    quad: {
      program: null as WebGLProgram | null,
      attributeVertex: -1 as number,
    },
    peek: {
      program: null as WebGLProgram | null,
      attributeVertex: -1 as number,
    },
    render: {
      program: null as WebGLProgram | null,
      attributeVertex: -1 as number,
      samplerBackground: -1 as WebGLUniformLocation,
      samplerWater: -1 as WebGLUniformLocation,
      debugFlag: -1 as WebGLUniformLocation,
    },
    water: {
      program: null as WebGLProgram | null,
      attributeVertex: -1 as number,
      sampler1: -1 as WebGLUniformLocation,
      sampler2: -1 as WebGLUniformLocation,
      waveVelocity: -1 as WebGLUniformLocation,
    },
    mouse: {
      program: null as WebGLProgram | null,
      attributeVertex: -1 as number,
      uniformMouse: -1 as WebGLUniformLocation,
    },
  };

  type Model = {
    bufferVertices: WebGLBuffer;
    bufferIndices: WebGLBuffer;
    dataVertices: number[];
    dataIndices: number[];
  };

  const models = {
    quad: null as Model | null,
  };

  type FrameBuffer = {
    frameBuffer: WebGLFramebuffer;
    texture: WebGLTexture;
  };
  let frameBuffers = [] as FrameBuffer[];

  const textures = {
    background: null as WebGLTexture | null,
  };

  let mouseClick = null as {
    x: number, y: number
  } | null;

  const drawQuad = () => {
    if(!models.quad) return;

    gl.useProgram(programs.quad.program);

    gl.bindBuffer(gl.ARRAY_BUFFER, models.quad.bufferVertices);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, models.quad.bufferIndices);

    const vertexAttribute = programs.quad.attributeVertex;
    gl.vertexAttribPointer(vertexAttribute, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertexAttribute);

    gl.drawElements(
      gl.TRIANGLES,
      models.quad.dataIndices.length,
      gl.UNSIGNED_SHORT,
      0
    );
  };

  const drawPeek = (texture: WebGLTexture) => {
    if(!models.quad) return;

    gl.useProgram(programs.peek.program);

    gl.bindBuffer(gl.ARRAY_BUFFER, models.quad.bufferVertices);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, models.quad.bufferIndices);

    const vertexAttribute = programs.quad.attributeVertex;
    gl.vertexAttribPointer(vertexAttribute, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertexAttribute);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.drawElements(
      gl.TRIANGLES,
      models.quad.dataIndices.length,
      gl.UNSIGNED_SHORT,
      0
    );
  };

  const drawMouse = () => {
    if(!models.quad) return;
    if(!mouseClick) return;

    gl.useProgram(programs.mouse.program);

    gl.bindBuffer(gl.ARRAY_BUFFER, models.quad.bufferVertices);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, models.quad.bufferIndices);

    const vertexAttribute = programs.mouse.attributeVertex;
    gl.vertexAttribPointer(vertexAttribute, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertexAttribute);

    gl.uniform2f(programs.mouse.uniformMouse, mouseClick.x, mouseClick.y);

    gl.drawElements(
      gl.TRIANGLES,
      models.quad.dataIndices.length,
      gl.UNSIGNED_SHORT,
      0
    );
  };

  const drawWater = () => {
    if(!models.quad) return;

    gl.useProgram(programs.water.program);

    gl.bindBuffer(gl.ARRAY_BUFFER, models.quad.bufferVertices);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, models.quad.bufferIndices);

    const vertexAttribute = programs.water.attributeVertex;
    gl.vertexAttribPointer(vertexAttribute, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertexAttribute);

    gl.uniform1i(programs.water.sampler1, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, frameBuffers[1].texture);

    gl.uniform1i(programs.water.sampler2, 1);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, frameBuffers[2].texture);

    gl.uniform1f(programs.water.waveVelocity, Number(canvas.args.waveVelocity));

    gl.drawElements(
      gl.TRIANGLES,
      models.quad.dataIndices.length,
      gl.UNSIGNED_SHORT,
      0
    );
  };

  const drawRender = () => {
    if(!models.quad) return;

    gl.useProgram(programs.render.program);

    gl.bindBuffer(gl.ARRAY_BUFFER, models.quad.bufferVertices);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, models.quad.bufferIndices);

    const vertexAttribute = programs.render.attributeVertex;
    gl.vertexAttribPointer(vertexAttribute, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertexAttribute);

    gl.uniform1i(programs.render.samplerBackground, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures.background);

    gl.uniform1i(programs.render.samplerWater, 1);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, frameBuffers[1].texture);

    gl.uniform1i(programs.render.debugFlag, Number(canvas.args.waveDebug));

    gl.drawElements(
      gl.TRIANGLES,
      models.quad.dataIndices.length,
      gl.UNSIGNED_SHORT,
      0
    );
  };

  const renderFrame = () => {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    //drawQuad();
    //drawMouse();
    drawRender();
    //drawPeek(frameBuffers[0].texture);
    //drawPeek(textures.background)
  };

  const updateAnimation = () => {
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffers[0].frameBuffer);

    drawWater();
    //drawQuad();

    // maybe? draw the mouse on all frameBuffers to avoid flickering effect
    if (mouseClick) {
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      drawMouse();
      gl.disable(gl.BLEND);
      mouseClick = null;
    }

    frameBuffers = [frameBuffers[2], frameBuffers[0], frameBuffers[1]];
  };

  const renderLoop = () => {
    updateAnimation();
    renderFrame();
    window.requestAnimationFrame(renderLoop);
  };

  const loadSourceCode = (url: string) => {
    return new Promise((resolve, reject) => {
      const request = new XMLHttpRequest();
      request.open("GET", url, true);
      request.onreadystatechange = function () {
        if (request.readyState == 4) {
          if (request.status !== 200) {
            reject(request.response);
          }

          resolve(request.response);
        }
      };
      request.send(null);
    }) as Promise<string>;
  };

  const getProgramAttribute = (program: WebGLProgram, key: string) => {
    const v = gl.getAttribLocation(program, key);
    if (!(v >= 0)) console.error(key, v);
    return v;
  };

  const getUniformLocation = (program: WebGLProgram, key: string) => {
    const v = gl.getUniformLocation(program, key);
    if (!v) console.error(key, v);
    return v;
  };

  const loadShaderVertex = (sourceCode: string) => {
    const shader = gl.createShader(gl.VERTEX_SHADER);
    if(!shader) throw "could not create shader";

    gl.shaderSource(shader, sourceCode);
    gl.compileShader(shader);
    return shader;
  };

  const loadShaderFragment = (sourceCode: string) => {
    const shader = gl.createShader(gl.FRAGMENT_SHADER);
    if(!shader) throw "could not create shader";

    gl.shaderSource(shader, sourceCode);
    gl.compileShader(shader);
    return shader;
  };

  const loadShaderProgram = (
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader
  ) => {
    const shaderProgram = gl.createProgram();
    if(!shaderProgram) throw "could not create program";

    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      console.error("program", gl.getProgramInfoLog(shaderProgram));
      console.error("vertex", gl.getShaderInfoLog(vertexShader));
      console.error("fragment", gl.getShaderInfoLog(fragmentShader));
    }

    return shaderProgram;
  };

  const loadModelQuad = () => {
    const dataVertices = [-1, -1, +1, -1, -1, +1, +1, +1];
    const dataIndices = [0, 2, 1, 3, 2, 1];

    const bufferVertices = gl.createBuffer();
    if(!bufferVertices) throw "could not create bufferVertices";

    gl.bindBuffer(gl.ARRAY_BUFFER, bufferVertices);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(dataVertices),
      gl.STATIC_DRAW
    );

    const bufferIndices = gl.createBuffer();
    if(!bufferIndices) throw "could not create bufferIndices";

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufferIndices);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(dataIndices),
      gl.STATIC_DRAW
    );

    const model = {
      bufferIndices,
      bufferVertices,
      dataIndices,
      dataVertices,
    };
    return model;
  };

  const loadFrameBuffer = () => {
    const width = canvasWidth;
    const height = canvasHeight;
    const data = Array(width * height * 4) as number[];
    data.fill(0, 0, data.length);

    // https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      width,
      height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array(data),
      0
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const frameBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);

    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      texture,
      0
    );

    return {
      frameBuffer,
      texture,
    } as FrameBuffer;
  };

  const loadImage = (url: string) => {
    return new Promise((resolve) => {
      const image = new Image();
      image.onload = function () {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          image
        );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        resolve(texture);
      };
      image.src = url;
    }) as Promise<WebGLTexture>;
  };

  frameBuffers.push(loadFrameBuffer());
  frameBuffers.push(loadFrameBuffer());
  frameBuffers.push(loadFrameBuffer());

  textures.background = await loadImage("background.jpg");

  models.quad = loadModelQuad();
  shaders.quad_vert = loadShaderVertex(await loadSourceCode("quad.vert"));
  shaders.quad_frag = loadShaderFragment(await loadSourceCode("quad.frag"));
  programs.quad.program = loadShaderProgram(
    shaders.quad_vert,
    shaders.quad_frag
  );
  programs.quad.attributeVertex = getProgramAttribute(
    programs.quad.program,
    "vertex"
  );

  shaders.peek_frag = loadShaderFragment(await loadSourceCode("peek.frag"));
  programs.peek.program = loadShaderProgram(
    shaders.quad_vert,
    shaders.peek_frag
  );
  programs.peek.attributeVertex = getProgramAttribute(
    programs.peek.program,
    "vertex"
  );

  shaders.render_frag = loadShaderFragment(await loadSourceCode("render.frag"));
  programs.render.program = loadShaderProgram(
    shaders.quad_vert,
    shaders.render_frag
  );
  programs.render.attributeVertex = getProgramAttribute(
    programs.render.program,
    "vertex"
  );
  programs.render.samplerBackground = getUniformLocation(
    programs.render.program,
    "samplerBackground"
  );
  programs.render.samplerWater = getUniformLocation(
    programs.render.program,
    "samplerWater"
  );
  programs.render.debugFlag = getUniformLocation(
    programs.render.program,
    "debugFlag"
  );

  shaders.water_frag = loadShaderFragment(await loadSourceCode("water.frag"));
  programs.water.program = loadShaderProgram(
    shaders.quad_vert,
    shaders.water_frag
  );
  programs.water.attributeVertex = getProgramAttribute(
    programs.water.program,
    "vertex"
  );
  programs.water.sampler1 = getUniformLocation(
    programs.water.program,
    "sampler1"
  );
  programs.water.sampler2 = getUniformLocation(
    programs.water.program,
    "sampler2"
  );
  programs.water.waveVelocity = getUniformLocation(
    programs.water.program,
    "waveVelocity"
  );

  shaders.mouse_frag = loadShaderFragment(await loadSourceCode("mouse.frag"));
  programs.mouse.program = loadShaderProgram(
    shaders.quad_vert,
    shaders.mouse_frag
  );
  programs.mouse.attributeVertex = getProgramAttribute(
    programs.mouse.program,
    "vertex"
  );
  programs.mouse.uniformMouse = getUniformLocation(
    programs.mouse.program,
    "mouse"
  );

  window.requestAnimationFrame(renderLoop);

  canvas.addEventListener("mousemove", (e) => {
    mouseClick = {
      x: (+e.offsetX / canvasWidth - 0.5) * 2.0,
      y: (-e.offsetY / canvasHeight + 0.5) * 2.0,
    };
  });
};

const GameCanvas = (waveDebug: boolean, waveVelocity: number) => {
  const ref = useWebGl(
    initGame,
    (canvas: HTMLCanvasElement) => {
      ref.current.args = {
        waveDebug,
        waveVelocity,
      } as Args;
    },
    [waveDebug, waveVelocity]
  );

  return <canvas ref={ref} width={canvasWidth} height={canvasHeight}></canvas>;
};

const index = () => {
  const [waveDebug, setWaveDebug] = useState<boolean>(false);
  const [waveVelocity, setWaveVelocity] = useState<number>(4.0);

  return (
    <>
      <h1>WebGL Ripples</h1>
      {GameCanvas(waveDebug, waveVelocity)}
      <Box>
        <FormControlLabel
          control={
            <Switch
              value={waveDebug}
              onChange={(_e, v: boolean) => setWaveDebug(v)}
            />
          }
          label="Wave Debug"
        />
        <FormControlLabel
          control={
            <Slider
              value={waveVelocity}
              min={0}
              max={32}
              step={0.1}
              onChange={(_e, v) => setWaveVelocity(v as number)}
              style={{ width: "200px", margin: "0em 1em 0em 1em" }}
              valueLabelDisplay="auto"
            />
          }
          label="Wave Velocity"
        ></FormControlLabel>
      </Box>
    </>
  );
};

export default index;
