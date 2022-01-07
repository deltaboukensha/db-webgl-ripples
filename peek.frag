#version 300 es
precision mediump float;
in vec2 st;
out vec4 fragment;
uniform sampler2D sampler0;

void main() {
  vec4 sample0 = texture(sampler0, vec2(st.s * 0.5 + 0.5, st.t * 0.5 + 0.5));
  fragment = sample0;
}