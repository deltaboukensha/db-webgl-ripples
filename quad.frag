#version 300 es
precision mediump float;
in vec2 st;
out vec4 fragment;

void main() {
  fragment = vec4(st.s, st.t, 0, 1);
}