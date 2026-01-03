// Render shaders for the three visual modes: thermodynamic, ink, prismatic

import { simplexNoise } from './noise';

export const renderThermodynamic = `
precision highp float;
uniform sampler2D u_density;
uniform vec3 u_hotColor;
uniform vec3 u_coldColor;
uniform vec3 u_equilibriumColor;
uniform float u_intensity;
varying vec2 v_uv;

void main() {
    vec3 density = texture2D(u_density, v_uv).rgb;
    float temperature = density.r - density.b;
    float activity = length(density.rg);
    
    vec3 hotCold;
    if (temperature > 0.0) {
        hotCold = mix(u_equilibriumColor, u_hotColor, min(temperature * 2.0, 1.0));
    } else {
        hotCold = mix(u_equilibriumColor, u_coldColor, min(-temperature * 2.0, 1.0));
    }
    
    float mixFactor = clamp(activity * 3.0, 0.0, 1.0);
    vec3 finalColor = mix(u_equilibriumColor, hotCold, mixFactor * u_intensity);
    gl_FragColor = vec4(finalColor, u_intensity * mixFactor * 0.8);
}
`;

export const renderInk = `
precision highp float;
uniform sampler2D u_density;
uniform vec3 u_inkColor;
uniform vec3 u_paperColor;
uniform float u_intensity;
varying vec2 v_uv;

${simplexNoise}

void main() {
    vec3 density = texture2D(u_density, v_uv).rgb;
    float concentration = length(density);
    
    float noise = snoise(v_uv * 8.0) * 0.15;
    concentration += noise * u_intensity;
    concentration = clamp(concentration, 0.0, 1.0);
    
    vec3 finalColor = mix(u_paperColor, u_inkColor, concentration * u_intensity);
    float alpha = concentration * u_intensity * 0.7;
    gl_FragColor = vec4(finalColor, alpha);
}
`;

export const renderPrismatic = `
precision highp float;
uniform sampler2D u_density;
uniform float u_time;
uniform float u_intensity;
uniform vec3 u_baseColor;
varying vec2 v_uv;

${simplexNoise}

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
    vec3 density = texture2D(u_density, v_uv).rgb;
    float activity = length(density);
    
    float hueBase = fbm(v_uv * 3.0 + u_time * 0.05, 4);
    float hueShift = snoise(v_uv * 5.0 + density.xy * 2.0) * 0.3;
    float hue = fract(hueBase * 0.5 + 0.5 + hueShift);
    
    float saturation = 0.6 + activity * 0.3;
    float value = 0.7 + activity * 0.25;
    
    vec3 rainbow = hsv2rgb(vec3(hue, saturation * u_intensity, value));
    vec3 finalColor = mix(u_baseColor, rainbow, activity * u_intensity);
    
    gl_FragColor = vec4(finalColor, activity * u_intensity * 0.75);
}
`;

export const displayShader = `
precision highp float;
uniform sampler2D u_texture;
varying vec2 v_uv;

void main() {
    gl_FragColor = texture2D(u_texture, v_uv);
}
`;
