#version 300 es
precision mediump float;
in vec2 st;
out vec4 fragment;
uniform vec2 mouse;

void main() {
  float value = 1.0-distance(vec2(0, 0), st);
  fragment = vec4(mod(value, mod(mouse.x + mouse.y, 0.6))*1.5, 0, 0, 1);
}