#version 300 es
precision mediump float;
in vec2 st;
out vec4 fragment;
uniform sampler2D samplerBackground;
uniform sampler2D samplerWater;

void main() {
  vec4 sampleWater = texture(samplerWater, vec2(st.s * 0.5 + 0.5, st.t * 0.5 + 0.5));
  float offset = sampleWater.r * 0.1;
  vec4 sampleBackground = texture(samplerBackground, vec2(st.s * 0.5 + 0.5 + offset, st.t * 0.5 + 0.5 + offset));
  
  fragment = sampleBackground;
}