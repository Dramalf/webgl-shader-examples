#version 300 es

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec2 a_position;
uniform vec2 u_resolution;
out vec2 v_texCoord;

// all shaders have a main function
void main() {
    vec2 zeroToOne = a_position / u_resolution;

    // convert from 0->1 to 0->2
    vec2 zeroToTwo = zeroToOne * 2.0f;

    // convert from 0->2 to -1->+1 (clip space)
    vec2 clipSpace = zeroToTwo - 1.0f;
  // gl_Position is a special variable a vertex shader
  // is responsible for setting
    v_texCoord = a_position;
    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

}