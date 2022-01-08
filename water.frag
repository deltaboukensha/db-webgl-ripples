#version 300 es
precision mediump float;
in vec2 st;
out vec4 fragment;
uniform sampler2D samplerPast;
uniform sampler2D samplerPast2;

void main() {
  float e = 1.0 / 512.0;
  vec4 center = texture(samplerPast, vec2(st.s * 0.5 + 0.5, st.t * 0.5 + 0.5));
  vec4 west = texture(samplerPast2, vec2(st.s * 0.5 + 0.5 - e, st.t * 0.5 + 0.5));
  vec4 east = texture(samplerPast2, vec2(st.s * 0.5 + 0.5 + e, st.t * 0.5 + 0.5));
  vec4 south = texture(samplerPast2, vec2(st.s * 0.5 + 0.5, st.t * 0.5 + 0.5 - e));
  vec4 north = texture(samplerPast2, vec2(st.s * 0.5 + 0.5, st.t * 0.5 + 0.5 + e));
  fragment = clamp((west + east + south + north) * 0.5 - center, vec4(-5.0, 0.0, 0.0, 0.0), vec4(+5.0, 0.0, 0.0, 0.0));
}