#version 300 es
precision mediump float;
in vec2 st;
out vec4 fragment;
uniform sampler2D samplerBackground;
uniform sampler2D samplerWater;

void main() {
  vec4 sampleBackground = texture(samplerBackground, vec2(st.s * 0.5 + 0.5, st.t * 0.5 + 0.5));
  vec4 sampleWater = texture(samplerWater, vec2(st.s * 0.5 + 0.5, st.t * 0.5 + 0.5));
  fragment = vec4(0, 0, 1, 0);
}