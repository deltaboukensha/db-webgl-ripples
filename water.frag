#version 300 es
precision mediump float;
in vec2 st;
out vec4 fragment;
uniform sampler2D sampler1;
uniform sampler2D sampler2;

void main() {
  float e = 1.0 / 512.0;
  vec4 center = texture(sampler1, vec2(st.s * 0.5 + 0.5, st.t * 0.5 + 0.5));
  vec4 west = texture(sampler2, vec2(st.s * 0.5 + 0.5 - e, st.t * 0.5 + 0.5));
  vec4 east = texture(sampler2, vec2(st.s * 0.5 + 0.5 + e, st.t * 0.5 + 0.5));
  vec4 south = texture(sampler2, vec2(st.s * 0.5 + 0.5, st.t * 0.5 + 0.5 - e));
  vec4 north = texture(sampler2, vec2(st.s * 0.5 + 0.5, st.t * 0.5 + 0.5 + e));
  vec4 total = (west + east + south + north) * 0.5 - center;
  fragment = clamp(total, vec4(-5.0, 0.0, 0.0, 0.0), vec4(+5.0, 0.0, 0.0, 0.0));
}
