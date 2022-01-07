#version 300 es
in vec2 vertex;
out vec2 xy;

void main() {
  gl_Position = vec4(vertex, 0, 1);
  xy = vertex;
}
