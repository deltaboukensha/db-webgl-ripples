const canvasWidth = 512;
const canvasHeight = 512;

const canvas = document.createElement("canvas");
canvas.width = canvasWidth;
canvas.height = canvasHeight;

const gl = canvas.getContext("webgl2");
const shaders = {
  quad_vert: null as WebGLShader,
  quad_frag: null as WebGLShader,
  render_frag: null as WebGLShader,
};

const programs = {
  quad: {
    program: null as WebGLProgram,
    attributeVertex: -1 as number,
  },
  render: {
    program: null as WebGLProgram,
    attributeVertex: -1 as number,
  },
};
const vertices = {};
const indices = {};

type Model = {
  bufferVertices: WebGLBuffer;
  bufferIndices: WebGLBuffer;
  dataVertices: number[];
  dataIndices: number[];
};

const models = {
  quad: null as Model,
};

const drawQuad = () => {
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

const drawRender = () => {
  gl.useProgram(programs.render.program);

  gl.bindBuffer(gl.ARRAY_BUFFER, models.quad.bufferVertices);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, models.quad.bufferIndices);

  const vertexAttribute = programs.render.attributeVertex;
  gl.vertexAttribPointer(vertexAttribute, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vertexAttribute);

  gl.drawElements(
    gl.TRIANGLES,
    models.quad.dataIndices.length,
    gl.UNSIGNED_SHORT,
    0
  );
};

const renderFrame = () => {
  gl.viewport(0, 0, canvasWidth, canvasHeight);
  gl.clearColor(0.529, 0.808, 0.922, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  //drawQuad();
  drawRender();

  window.requestAnimationFrame(renderFrame);
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
  if (v === -1) console.error(key, v);
  return v;
};

const loadShaderVertex = (sourceCode: string) => {
  const shader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(shader, sourceCode);
  gl.compileShader(shader);
  return shader;
};

const loadShaderFragment = (sourceCode: string) => {
  const shader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(shader, sourceCode);
  gl.compileShader(shader);
  return shader;
};

const loadShaderProgram = (
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader
) => {
  const shaderProgram = gl.createProgram();
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
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferVertices);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(dataVertices),
    gl.STATIC_DRAW
  );

  const bufferIndices = gl.createBuffer();
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

document.addEventListener("DOMContentLoaded", async () => {
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

  shaders.render_frag = loadShaderFragment(await loadSourceCode("render.frag"));
  programs.render.program = loadShaderProgram(
    shaders.quad_vert,
    shaders.render_frag
  );
  programs.render.attributeVertex = getProgramAttribute(
    programs.render.program,
    "vertex"
  );

  document.body.appendChild(canvas);
  window.requestAnimationFrame(renderFrame);
});
