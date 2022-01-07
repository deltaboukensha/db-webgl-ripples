#version 300 es
precision mediump float;
in vec2 xy;
out vec4 fragment;

void main() {
  fragment = vec4(xy.x, xy.y, 0, 1);
}