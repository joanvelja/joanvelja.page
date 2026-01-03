// GLSL shaders for Stable Fluids algorithm (Navier-Stokes solver)

export const baseVertex = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

export const advection = `
precision highp float;
uniform sampler2D u_velocity;
uniform sampler2D u_source;
uniform vec2 u_texelSize;
uniform float u_dt;
uniform float u_dissipation;
varying vec2 v_uv;

void main() {
    vec2 vel = texture2D(u_velocity, v_uv).xy;
    vec2 prevPos = v_uv - vel * u_dt * u_texelSize;
    gl_FragColor = u_dissipation * texture2D(u_source, prevPos);
}
`;

export const divergence = `
precision highp float;
uniform sampler2D u_velocity;
uniform vec2 u_texelSize;
varying vec2 v_uv;

void main() {
    float L = texture2D(u_velocity, v_uv - vec2(u_texelSize.x, 0.0)).x;
    float R = texture2D(u_velocity, v_uv + vec2(u_texelSize.x, 0.0)).x;
    float B = texture2D(u_velocity, v_uv - vec2(0.0, u_texelSize.y)).y;
    float T = texture2D(u_velocity, v_uv + vec2(0.0, u_texelSize.y)).y;
    float div = 0.5 * (R - L + T - B);
    gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
}
`;

export const pressure = `
precision highp float;
uniform sampler2D u_pressure;
uniform sampler2D u_divergence;
uniform vec2 u_texelSize;
varying vec2 v_uv;

void main() {
    float L = texture2D(u_pressure, v_uv - vec2(u_texelSize.x, 0.0)).x;
    float R = texture2D(u_pressure, v_uv + vec2(u_texelSize.x, 0.0)).x;
    float B = texture2D(u_pressure, v_uv - vec2(0.0, u_texelSize.y)).y;
    float T = texture2D(u_pressure, v_uv + vec2(0.0, u_texelSize.y)).y;
    float div = texture2D(u_divergence, v_uv).x;
    gl_FragColor = vec4((L + R + B + T - div) * 0.25, 0.0, 0.0, 1.0);
}
`;

export const gradientSubtract = `
precision highp float;
uniform sampler2D u_pressure;
uniform sampler2D u_velocity;
uniform vec2 u_texelSize;
varying vec2 v_uv;

void main() {
    float L = texture2D(u_pressure, v_uv - vec2(u_texelSize.x, 0.0)).x;
    float R = texture2D(u_pressure, v_uv + vec2(u_texelSize.x, 0.0)).x;
    float B = texture2D(u_pressure, v_uv - vec2(0.0, u_texelSize.y)).x;
    float T = texture2D(u_pressure, v_uv + vec2(0.0, u_texelSize.y)).x;
    vec2 vel = texture2D(u_velocity, v_uv).xy;
    vel -= 0.5 * vec2(R - L, T - B);
    gl_FragColor = vec4(vel, 0.0, 1.0);
}
`;

export const addForce = `
precision highp float;
uniform sampler2D u_velocity;
uniform vec2 u_point;
uniform vec2 u_force;
uniform float u_radius;
varying vec2 v_uv;

void main() {
    vec2 vel = texture2D(u_velocity, v_uv).xy;
    float d = distance(v_uv, u_point);
    float influence = exp(-d * d / u_radius);
    vel += u_force * influence;
    gl_FragColor = vec4(vel, 0.0, 1.0);
}
`;

export const addDensity = `
precision highp float;
uniform sampler2D u_density;
uniform vec2 u_point;
uniform vec3 u_color;
uniform float u_radius;
varying vec2 v_uv;

void main() {
    vec3 density = texture2D(u_density, v_uv).rgb;
    float d = distance(v_uv, u_point);
    float influence = exp(-d * d / u_radius);
    density += u_color * influence;
    gl_FragColor = vec4(density, 1.0);
}
`;
