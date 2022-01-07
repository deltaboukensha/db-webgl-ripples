#version 300 es
precision mediump float;
in vec2 st;
out vec4 fragment;
uniform sampler2D samplerPast;

void main() {
  float e = 0.01;
  vec4 center = texture(samplerPast, vec2(st.s * 0.5 + 0.5, st.t * 0.5 + 0.5));
  vec4 west = texture(samplerPast, vec2(st.s * 0.5 + 0.5 - e, st.t * 0.5 + 0.5));
  vec4 east = texture(samplerPast, vec2(st.s * 0.5 + 0.5 + e, st.t * 0.5 + 0.5));
  vec4 south = texture(samplerPast, vec2(st.s * 0.5 + 0.5, st.t * 0.5 + 0.5 - e));
  vec4 north = texture(samplerPast, vec2(st.s * 0.5 + 0.5, st.t * 0.5 + 0.5 + e));
  fragment = (center + west) * 0.5;
}