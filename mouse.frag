#version 300 es
precision mediump float;
in vec2 st;
out vec4 fragment;
uniform vec2 mouse;

void main() {
  float d = distance(mouse, st);
  float a = (1.0 - d * 10.0);
  fragment = vec4(a, 0, 0, a);
}