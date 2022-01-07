#version 300 es
precision mediump float;
in vec2 st;
out vec4 fragment;
uniform vec2 mouse;

void main() {
  float d = distance(mouse, st);
  fragment = vec4((1.0 - d * 10.0), 0, 0, 1);
}