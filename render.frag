#version 300 es
precision mediump float;
in vec2 st;
out vec4 fragment;
uniform sampler2D samplerBackground;

void main() {
  vec4 backgroundSample = texture(samplerBackground, vec2(st.s * 0.5 + 0.5, st.t * 0.5 + 0.5));
  fragment = backgroundSample;
}