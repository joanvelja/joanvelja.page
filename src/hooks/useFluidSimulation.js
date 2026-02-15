'use client';

import { useRef, useCallback, useEffect } from 'react';

const SIM_RESOLUTION = 64;
const TEXEL_SIZE = Object.freeze([1.0 / SIM_RESOLUTION, 1.0 / SIM_RESOLUTION]);
const JACOBI_ITERATIONS = 20;
const BUOYANCY = 0.12;
const VORTICITY_CONFINEMENT = 3.0;
const VELOCITY_DISSIPATION = 0.99;
const DENSITY_DISSIPATION = 1.0;
const DT = 1 / 60;
const TAU = Math.PI * 2;

const baseVertex = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const initDensityFragment = `
precision highp float;
uniform float u_seed;
varying vec2 v_uv;
const float TAU = 6.283185307;
void main() {
    float pertTop = 0.0;
    pertTop += 0.04  * sin(2.0 * TAU * v_uv.x + u_seed);
    pertTop += 0.025 * sin(3.0 * TAU * v_uv.x + u_seed * 1.7);
    pertTop += 0.015 * sin(5.0 * TAU * v_uv.x + u_seed * 2.3);
    pertTop += 0.01  * sin(7.0 * TAU * v_uv.x + u_seed * 3.1);

    float pertBot = 0.0;
    pertBot += 0.04  * sin(2.0 * TAU * v_uv.x + u_seed * 2.1);
    pertBot += 0.025 * sin(3.0 * TAU * v_uv.x + u_seed * 0.8);
    pertBot += 0.015 * sin(5.0 * TAU * v_uv.x + u_seed * 1.4);
    pertBot += 0.01  * sin(7.0 * TAU * v_uv.x + u_seed * 0.5);

    float topEdge = 0.82 + pertTop;
    float heavy = smoothstep(topEdge - 0.03, topEdge + 0.03, v_uv.y);

    float botEdge = 0.18 + pertBot;
    float light = 1.0 - smoothstep(botEdge - 0.03, botEdge + 0.03, v_uv.y);

    gl_FragColor = vec4(heavy, light, 0.0, 1.0);
}
`;

const advectionFragment_float = `
precision highp float;
uniform sampler2D u_velocity;
uniform sampler2D u_source;
uniform vec2 u_texelSize;
uniform float u_dt;
uniform float u_dissipation;
varying vec2 v_uv;
void main() {
    vec2 vel = texture2D(u_velocity, v_uv).xy;
    vec2 prevPos = v_uv - vel * u_dt;
    prevPos = clamp(prevPos, 0.5 * u_texelSize, 1.0 - 0.5 * u_texelSize);
    gl_FragColor = u_dissipation * texture2D(u_source, prevPos);
}
`;

const advectionFragment_byte = `
precision highp float;
uniform sampler2D u_velocity;
uniform sampler2D u_source;
uniform vec2 u_texelSize;
uniform float u_dt;
uniform float u_dissipation;
uniform float u_isVelocity;
varying vec2 v_uv;
void main() {
    vec2 vel = texture2D(u_velocity, v_uv).xy * 2.0 - 1.0;
    vec2 prevPos = v_uv - vel * u_dt;
    prevPos = clamp(prevPos, 0.5 * u_texelSize, 1.0 - 0.5 * u_texelSize);
    vec4 result = u_dissipation * texture2D(u_source, prevPos);
    if (u_isVelocity > 0.5) {
        result.xy = result.xy * 2.0 - 1.0;
        result.xy = result.xy * u_dissipation;
        result.xy = result.xy * 0.5 + 0.5;
        gl_FragColor = result;
    } else {
        gl_FragColor = result;
    }
}
`;

const buoyancyFragment_float = `
precision highp float;
uniform sampler2D u_velocity;
uniform sampler2D u_density;
uniform float u_buoyancy;
uniform float u_dt;
varying vec2 v_uv;
void main() {
    vec2 vel = texture2D(u_velocity, v_uv).xy;
    float heavy = texture2D(u_density, v_uv).r;
    float light = texture2D(u_density, v_uv).g;
    vel.y += -u_buoyancy * (heavy - light) * u_dt;
    gl_FragColor = vec4(vel, 0.0, 1.0);
}
`;

const buoyancyFragment_byte = `
precision highp float;
uniform sampler2D u_velocity;
uniform sampler2D u_density;
uniform float u_buoyancy;
uniform float u_dt;
varying vec2 v_uv;
void main() {
    vec2 vel = texture2D(u_velocity, v_uv).xy * 2.0 - 1.0;
    float heavy = texture2D(u_density, v_uv).r;
    float light = texture2D(u_density, v_uv).g;
    vel.y += -u_buoyancy * (heavy - light) * u_dt;
    gl_FragColor = vec4(vel * 0.5 + 0.5, 0.5, 1.0);
}
`;

const vorticityFragment_float = `
precision highp float;
uniform sampler2D u_velocity;
uniform vec2 u_texelSize;
varying vec2 v_uv;
void main() {
    float vR = texture2D(u_velocity, v_uv + vec2(u_texelSize.x, 0.0)).y;
    float vL = texture2D(u_velocity, v_uv - vec2(u_texelSize.x, 0.0)).y;
    float vT = texture2D(u_velocity, v_uv + vec2(0.0, u_texelSize.y)).x;
    float vB = texture2D(u_velocity, v_uv - vec2(0.0, u_texelSize.y)).x;
    float curl = (vR - vL) / (2.0 * u_texelSize.x) - (vT - vB) / (2.0 * u_texelSize.y);
    gl_FragColor = vec4(curl, 0.0, 0.0, 1.0);
}
`;

const vorticityFragment_byte = `
precision highp float;
uniform sampler2D u_velocity;
uniform vec2 u_texelSize;
varying vec2 v_uv;
void main() {
    float vR = texture2D(u_velocity, v_uv + vec2(u_texelSize.x, 0.0)).y * 2.0 - 1.0;
    float vL = texture2D(u_velocity, v_uv - vec2(u_texelSize.x, 0.0)).y * 2.0 - 1.0;
    float vT = texture2D(u_velocity, v_uv + vec2(0.0, u_texelSize.y)).x * 2.0 - 1.0;
    float vB = texture2D(u_velocity, v_uv - vec2(0.0, u_texelSize.y)).x * 2.0 - 1.0;
    float curl = (vR - vL) / (2.0 * u_texelSize.x) - (vT - vB) / (2.0 * u_texelSize.y);
    gl_FragColor = vec4(curl * 0.5 + 0.5, 0.5, 0.5, 1.0);
}
`;

const vorticityConfinementFragment_float = `
precision highp float;
uniform sampler2D u_velocity;
uniform sampler2D u_vorticity;
uniform vec2 u_texelSize;
uniform float u_confinement;
uniform float u_dt;
varying vec2 v_uv;
void main() {
    float wC = texture2D(u_vorticity, v_uv).r;
    float wR = texture2D(u_vorticity, v_uv + vec2(u_texelSize.x, 0.0)).r;
    float wL = texture2D(u_vorticity, v_uv - vec2(u_texelSize.x, 0.0)).r;
    float wT = texture2D(u_vorticity, v_uv + vec2(0.0, u_texelSize.y)).r;
    float wB = texture2D(u_vorticity, v_uv - vec2(0.0, u_texelSize.y)).r;
    vec2 eta = vec2(abs(wR) - abs(wL), abs(wT) - abs(wB));
    float len = length(eta);
    if (len > 1e-5) eta /= len;
    vec2 force = u_confinement * vec2(eta.y, -eta.x) * wC;
    vec2 vel = texture2D(u_velocity, v_uv).xy;
    vel += force * u_dt;
    gl_FragColor = vec4(vel, 0.0, 1.0);
}
`;

const vorticityConfinementFragment_byte = `
precision highp float;
uniform sampler2D u_velocity;
uniform sampler2D u_vorticity;
uniform vec2 u_texelSize;
uniform float u_confinement;
uniform float u_dt;
varying vec2 v_uv;
void main() {
    float wC = texture2D(u_vorticity, v_uv).r * 2.0 - 1.0;
    float wR = texture2D(u_vorticity, v_uv + vec2(u_texelSize.x, 0.0)).r * 2.0 - 1.0;
    float wL = texture2D(u_vorticity, v_uv - vec2(u_texelSize.x, 0.0)).r * 2.0 - 1.0;
    float wT = texture2D(u_vorticity, v_uv + vec2(0.0, u_texelSize.y)).r * 2.0 - 1.0;
    float wB = texture2D(u_vorticity, v_uv - vec2(0.0, u_texelSize.y)).r * 2.0 - 1.0;
    vec2 eta = vec2(abs(wR) - abs(wL), abs(wT) - abs(wB));
    float len = length(eta);
    if (len > 1e-5) eta /= len;
    vec2 force = u_confinement * vec2(eta.y, -eta.x) * wC;
    vec2 vel = texture2D(u_velocity, v_uv).xy * 2.0 - 1.0;
    vel += force * u_dt;
    gl_FragColor = vec4(vel * 0.5 + 0.5, 0.5, 1.0);
}
`;

const divergenceFragment_float = `
precision highp float;
uniform sampler2D u_velocity;
uniform vec2 u_texelSize;
varying vec2 v_uv;
void main() {
    float vR = texture2D(u_velocity, v_uv + vec2(u_texelSize.x, 0.0)).x;
    float vL = texture2D(u_velocity, v_uv - vec2(u_texelSize.x, 0.0)).x;
    float vT = texture2D(u_velocity, v_uv + vec2(0.0, u_texelSize.y)).y;
    float vB = texture2D(u_velocity, v_uv - vec2(0.0, u_texelSize.y)).y;
    float div = 0.5 * (vR - vL + vT - vB);
    gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
}
`;

const divergenceFragment_byte = `
precision highp float;
uniform sampler2D u_velocity;
uniform vec2 u_texelSize;
varying vec2 v_uv;
void main() {
    float vR = texture2D(u_velocity, v_uv + vec2(u_texelSize.x, 0.0)).x * 2.0 - 1.0;
    float vL = texture2D(u_velocity, v_uv - vec2(u_texelSize.x, 0.0)).x * 2.0 - 1.0;
    float vT = texture2D(u_velocity, v_uv + vec2(0.0, u_texelSize.y)).y * 2.0 - 1.0;
    float vB = texture2D(u_velocity, v_uv - vec2(0.0, u_texelSize.y)).y * 2.0 - 1.0;
    float div = 0.5 * (vR - vL + vT - vB);
    gl_FragColor = vec4(div * 0.5 + 0.5, 0.5, 0.5, 1.0);
}
`;

const pressureFragment_float = `
precision highp float;
uniform sampler2D u_pressure;
uniform sampler2D u_divergence;
uniform vec2 u_texelSize;
varying vec2 v_uv;
void main() {
    float pR = texture2D(u_pressure, v_uv + vec2(u_texelSize.x, 0.0)).r;
    float pL = texture2D(u_pressure, v_uv - vec2(u_texelSize.x, 0.0)).r;
    float pT = texture2D(u_pressure, v_uv + vec2(0.0, u_texelSize.y)).r;
    float pB = texture2D(u_pressure, v_uv - vec2(0.0, u_texelSize.y)).r;
    float div = texture2D(u_divergence, v_uv).r;
    float p = (pL + pR + pB + pT - div) * 0.25;
    gl_FragColor = vec4(p, 0.0, 0.0, 1.0);
}
`;

const pressureFragment_byte = `
precision highp float;
uniform sampler2D u_pressure;
uniform sampler2D u_divergence;
uniform vec2 u_texelSize;
varying vec2 v_uv;
void main() {
    float pR = texture2D(u_pressure, v_uv + vec2(u_texelSize.x, 0.0)).r * 4.0 - 2.0;
    float pL = texture2D(u_pressure, v_uv - vec2(u_texelSize.x, 0.0)).r * 4.0 - 2.0;
    float pT = texture2D(u_pressure, v_uv + vec2(0.0, u_texelSize.y)).r * 4.0 - 2.0;
    float pB = texture2D(u_pressure, v_uv - vec2(0.0, u_texelSize.y)).r * 4.0 - 2.0;
    float div = texture2D(u_divergence, v_uv).r * 2.0 - 1.0;
    float p = (pL + pR + pB + pT - div) * 0.25;
    gl_FragColor = vec4(p * 0.25 + 0.5, 0.5, 0.5, 1.0);
}
`;

const gradientSubtractFragment_float = `
precision highp float;
uniform sampler2D u_velocity;
uniform sampler2D u_pressure;
uniform vec2 u_texelSize;
varying vec2 v_uv;
void main() {
    float pR = texture2D(u_pressure, v_uv + vec2(u_texelSize.x, 0.0)).r;
    float pL = texture2D(u_pressure, v_uv - vec2(u_texelSize.x, 0.0)).r;
    float pT = texture2D(u_pressure, v_uv + vec2(0.0, u_texelSize.y)).r;
    float pB = texture2D(u_pressure, v_uv - vec2(0.0, u_texelSize.y)).r;
    vec2 vel = texture2D(u_velocity, v_uv).xy;
    vel.x -= 0.5 * (pR - pL);
    vel.y -= 0.5 * (pT - pB);
    gl_FragColor = vec4(vel, 0.0, 1.0);
}
`;

const gradientSubtractFragment_byte = `
precision highp float;
uniform sampler2D u_velocity;
uniform sampler2D u_pressure;
uniform vec2 u_texelSize;
varying vec2 v_uv;
void main() {
    float pR = texture2D(u_pressure, v_uv + vec2(u_texelSize.x, 0.0)).r * 4.0 - 2.0;
    float pL = texture2D(u_pressure, v_uv - vec2(u_texelSize.x, 0.0)).r * 4.0 - 2.0;
    float pT = texture2D(u_pressure, v_uv + vec2(0.0, u_texelSize.y)).r * 4.0 - 2.0;
    float pB = texture2D(u_pressure, v_uv - vec2(0.0, u_texelSize.y)).r * 4.0 - 2.0;
    vec2 vel = texture2D(u_velocity, v_uv).xy * 2.0 - 1.0;
    vel.x -= 0.5 * (pR - pL);
    vel.y -= 0.5 * (pT - pB);
    gl_FragColor = vec4(vel * 0.5 + 0.5, 0.5, 1.0);
}
`;

const displayFragment = `
precision highp float;
uniform sampler2D u_density;
uniform vec3 u_hotColor;
uniform vec3 u_coldColor;
varying vec2 v_uv;
void main() {
    float heavy = texture2D(u_density, v_uv).r;
    float light = texture2D(u_density, v_uv).g;
    float total = heavy + light;
    vec3 color = vec3(0.0);
    if (total > 0.01) {
        color = (u_hotColor * heavy + u_coldColor * light) / total;
    }
    float alpha = smoothstep(0.0, 0.5, total);
    gl_FragColor = vec4(color, alpha);
}
`;

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function createProgram(gl, vertexSource, fragmentSource) {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    if (!vertexShader || !fragmentShader) return null;

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program link error:', gl.getProgramInfoLog(program));
        return null;
    }
    return program;
}

function probeTextureFormat(gl) {
    const floatExt = gl.getExtension('OES_texture_float');
    const floatBufExt = gl.getExtension('WEBGL_color_buffer_float');
    const floatLinExt = gl.getExtension('OES_texture_float_linear');

    if (floatExt && floatLinExt) {
        if (floatBufExt) {
            if (testFBO(gl, gl.FLOAT)) return 'float';
        }
        if (testFBO(gl, gl.FLOAT)) return 'float';
    }

    const halfExt = gl.getExtension('OES_texture_half_float');
    const halfBufExt = gl.getExtension('EXT_color_buffer_half_float');
    gl.getExtension('OES_texture_half_float_linear');

    if (halfExt) {
        const halfType = halfExt.HALF_FLOAT_OES;
        if (halfBufExt && testFBO(gl, halfType)) return 'half';
        if (testFBO(gl, halfType)) return 'half';
    }

    return 'byte';
}

function testFBO(gl, type) {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 4, 4, 0, gl.RGBA, type, null);

    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.deleteFramebuffer(fb);
    gl.deleteTexture(tex);

    return status === gl.FRAMEBUFFER_COMPLETE;
}

function getTextureType(gl, format) {
    if (format === 'float') return gl.FLOAT;
    if (format === 'half') {
        const ext = gl.getExtension('OES_texture_half_float');
        return ext ? ext.HALF_FLOAT_OES : gl.UNSIGNED_BYTE;
    }
    return gl.UNSIGNED_BYTE;
}

function createTexture(gl, width, height, type) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, type, null);
    return texture;
}

function createFramebuffer(gl, texture) {
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    return fb;
}

function createDoubleFBO(gl, width, height, type) {
    const texA = createTexture(gl, width, height, type);
    const texB = createTexture(gl, width, height, type);
    return {
        read: { texture: texA, framebuffer: createFramebuffer(gl, texA) },
        write: { texture: texB, framebuffer: createFramebuffer(gl, texB) },
        swap() {
            const temp = this.read;
            this.read = this.write;
            this.write = temp;
        }
    };
}

export function useFluidSimulation(canvasRef) {
    const glRef = useRef(null);
    const programsRef = useRef({});
    const fbosRef = useRef({});
    const animationRef = useRef(null);
    const intensityRef = useRef(0);
    const quadRef = useRef(null);
    const initializedRef = useRef(false);
    const contextLostRef = useRef(false);
    const texFormatRef = useRef('byte');
    const seedRef = useRef(0);
    const colorsRef = useRef(null);

    const init = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || initializedRef.current) return true;

        const gl = canvas.getContext('webgl', {
            premultipliedAlpha: false,
            alpha: true,
        });
        if (!gl) return false;

        canvas.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
            contextLostRef.current = true;
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        });

        canvas.addEventListener('webglcontextrestored', () => {
            contextLostRef.current = false;
            initializedRef.current = false;
        });

        glRef.current = gl;
        initializedRef.current = true;

        const format = probeTextureFormat(gl);
        texFormatRef.current = format;
        const isByte = format === 'byte';
        const texType = getTextureType(gl, format);

        programsRef.current = {
            initDensity: createProgram(gl, baseVertex, initDensityFragment),
            advection: createProgram(gl, baseVertex, isByte ? advectionFragment_byte : advectionFragment_float),
            buoyancy: createProgram(gl, baseVertex, isByte ? buoyancyFragment_byte : buoyancyFragment_float),
            vorticity: createProgram(gl, baseVertex, isByte ? vorticityFragment_byte : vorticityFragment_float),
            vorticityConfinement: createProgram(gl, baseVertex, isByte ? vorticityConfinementFragment_byte : vorticityConfinementFragment_float),
            divergence: createProgram(gl, baseVertex, isByte ? divergenceFragment_byte : divergenceFragment_float),
            pressure: createProgram(gl, baseVertex, isByte ? pressureFragment_byte : pressureFragment_float),
            gradientSubtract: createProgram(gl, baseVertex, isByte ? gradientSubtractFragment_byte : gradientSubtractFragment_float),
            display: createProgram(gl, baseVertex, displayFragment),
        };

        for (const [name, prog] of Object.entries(programsRef.current)) {
            if (!prog) {
                console.error(`Failed to create program: ${name}`);
                return false;
            }
        }

        fbosRef.current = {
            velocity: createDoubleFBO(gl, SIM_RESOLUTION, SIM_RESOLUTION, texType),
            density: createDoubleFBO(gl, SIM_RESOLUTION, SIM_RESOLUTION, gl.UNSIGNED_BYTE),
            pressure: createDoubleFBO(gl, SIM_RESOLUTION, SIM_RESOLUTION, texType),
            divergence: createDoubleFBO(gl, SIM_RESOLUTION, SIM_RESOLUTION, texType),
            vorticity: createDoubleFBO(gl, SIM_RESOLUTION, SIM_RESOLUTION, texType),
        };

        const quad = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, quad);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
        quadRef.current = quad;

        return true;
    }, [canvasRef]);

    const blit = useCallback((target) => {
        const gl = glRef.current;
        if (!gl) return;
        gl.bindFramebuffer(gl.FRAMEBUFFER, target || null);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }, []);

    const bindProgram = useCallback((program) => {
        const gl = glRef.current;
        gl.useProgram(program);
        const posLoc = gl.getAttribLocation(program, 'a_position');
        gl.bindBuffer(gl.ARRAY_BUFFER, quadRef.current);
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
        return (name, value) => {
            const loc = gl.getUniformLocation(program, name);
            if (loc === null) return;
            if (typeof value === 'number') {
                gl.uniform1f(loc, value);
            } else if (value.length === 2) {
                gl.uniform2fv(loc, value);
            } else if (value.length === 3) {
                gl.uniform3fv(loc, value);
            } else if (value.length === 4) {
                gl.uniform4fv(loc, value);
            }
        };
    }, []);

    const bindTexture = useCallback((unit, texture, name, program) => {
        const gl = glRef.current;
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        const loc = gl.getUniformLocation(program, name);
        if (loc) gl.uniform1i(loc, unit);
    }, []);

    const initDensity = useCallback(() => {
        const gl = glRef.current;
        const progs = programsRef.current;
        const fbos = fbosRef.current;
        if (!gl || !progs.initDensity) return;

        gl.viewport(0, 0, SIM_RESOLUTION, SIM_RESOLUTION);

        const setUniform = bindProgram(progs.initDensity);
        setUniform('u_seed', seedRef.current);
        blit(fbos.density.write.framebuffer);
        fbos.density.swap();
    }, [bindProgram, blit]);

    const clearFBOs = useCallback(() => {
        const gl = glRef.current;
        const fbos = fbosRef.current;
        if (!gl) return;

        for (const fbo of Object.values(fbos)) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, fbo.read.framebuffer);
            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.bindFramebuffer(gl.FRAMEBUFFER, fbo.write.framebuffer);
            gl.clear(gl.COLOR_BUFFER_BIT);
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }, []);

    const simulate = useCallback(() => {
        const gl = glRef.current;
        const progs = programsRef.current;
        const fbos = fbosRef.current;
        if (!gl || !progs.advection) return;

        gl.viewport(0, 0, SIM_RESOLUTION, SIM_RESOLUTION);

        const intensity = intensityRef.current;
        const effectiveBuoyancy = BUOYANCY * intensity;
        const effectiveDissipation = VELOCITY_DISSIPATION;
        const effectiveConfinement = VORTICITY_CONFINEMENT * intensity;
        const isByte = texFormatRef.current === 'byte';
        const jacobiIters = isByte ? 8 : JACOBI_ITERATIONS;

        // 1. Vorticity (curl)
        let setUniform = bindProgram(progs.vorticity);
        bindTexture(0, fbos.velocity.read.texture, 'u_velocity', progs.vorticity);
        setUniform('u_texelSize', TEXEL_SIZE);
        blit(fbos.vorticity.write.framebuffer);
        fbos.vorticity.swap();

        // 2. Vorticity confinement
        setUniform = bindProgram(progs.vorticityConfinement);
        bindTexture(0, fbos.velocity.read.texture, 'u_velocity', progs.vorticityConfinement);
        bindTexture(1, fbos.vorticity.read.texture, 'u_vorticity', progs.vorticityConfinement);
        setUniform('u_texelSize', TEXEL_SIZE);
        setUniform('u_confinement', effectiveConfinement);
        setUniform('u_dt', DT);
        blit(fbos.velocity.write.framebuffer);
        fbos.velocity.swap();

        // 3. Buoyancy
        setUniform = bindProgram(progs.buoyancy);
        bindTexture(0, fbos.velocity.read.texture, 'u_velocity', progs.buoyancy);
        bindTexture(1, fbos.density.read.texture, 'u_density', progs.buoyancy);
        setUniform('u_buoyancy', effectiveBuoyancy);
        setUniform('u_dt', DT);
        blit(fbos.velocity.write.framebuffer);
        fbos.velocity.swap();

        // 4. Divergence
        setUniform = bindProgram(progs.divergence);
        bindTexture(0, fbos.velocity.read.texture, 'u_velocity', progs.divergence);
        setUniform('u_texelSize', TEXEL_SIZE);
        blit(fbos.divergence.write.framebuffer);
        fbos.divergence.swap();

        // 5. Zero pressure (cold-start)
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbos.pressure.write.framebuffer);
        if (isByte) {
            gl.clearColor(0.5, 0.5, 0.5, 1.0);
        } else {
            gl.clearColor(0, 0, 0, 1);
        }
        gl.clear(gl.COLOR_BUFFER_BIT);
        fbos.pressure.swap();

        // 6. Pressure solve (Jacobi)
        for (let i = 0; i < jacobiIters; i++) {
            setUniform = bindProgram(progs.pressure);
            bindTexture(0, fbos.pressure.read.texture, 'u_pressure', progs.pressure);
            bindTexture(1, fbos.divergence.read.texture, 'u_divergence', progs.pressure);
            setUniform('u_texelSize', TEXEL_SIZE);
            blit(fbos.pressure.write.framebuffer);
            fbos.pressure.swap();
        }

        // 7. Gradient subtraction
        setUniform = bindProgram(progs.gradientSubtract);
        bindTexture(0, fbos.velocity.read.texture, 'u_velocity', progs.gradientSubtract);
        bindTexture(1, fbos.pressure.read.texture, 'u_pressure', progs.gradientSubtract);
        setUniform('u_texelSize', TEXEL_SIZE);
        blit(fbos.velocity.write.framebuffer);
        fbos.velocity.swap();

        // 8. Advect velocity
        setUniform = bindProgram(progs.advection);
        bindTexture(0, fbos.velocity.read.texture, 'u_velocity', progs.advection);
        bindTexture(1, fbos.velocity.read.texture, 'u_source', progs.advection);
        setUniform('u_texelSize', TEXEL_SIZE);
        setUniform('u_dt', DT);
        setUniform('u_dissipation', effectiveDissipation);
        if (isByte) setUniform('u_isVelocity', 1.0);
        blit(fbos.velocity.write.framebuffer);
        fbos.velocity.swap();

        // 9. Advect density
        setUniform = bindProgram(progs.advection);
        bindTexture(0, fbos.velocity.read.texture, 'u_velocity', progs.advection);
        bindTexture(1, fbos.density.read.texture, 'u_source', progs.advection);
        setUniform('u_texelSize', TEXEL_SIZE);
        setUniform('u_dt', DT);
        setUniform('u_dissipation', DENSITY_DISSIPATION);
        if (isByte) setUniform('u_isVelocity', 0.0);
        blit(fbos.density.write.framebuffer);
        fbos.density.swap();
    }, [bindProgram, bindTexture, blit]);

    const render = useCallback(() => {
        const gl = glRef.current;
        const progs = programsRef.current;
        const fbos = fbosRef.current;
        const colors = colorsRef.current;
        if (!gl || !colors) return;

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        const setUniform = bindProgram(progs.display);
        bindTexture(0, fbos.density.read.texture, 'u_density', progs.display);
        setUniform('u_hotColor', colors.hot);
        setUniform('u_coldColor', colors.cold);

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        blit(null);
        gl.disable(gl.BLEND);
    }, [bindProgram, bindTexture, blit]);

    const stop = useCallback(() => {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }
    }, []);

    const start = useCallback((colors, { fresh = true } = {}) => {
        stop();
        if (!init()) return;

        colorsRef.current = colors;

        if (fresh) {
            seedRef.current = Math.random() * TAU;
            clearFBOs();
            initDensity();
        }

        const animate = () => {
            if (document.hidden || contextLostRef.current) {
                animationRef.current = requestAnimationFrame(animate);
                return;
            }

            if (intensityRef.current < 0.01) {
                animationRef.current = null;
                return;
            }

            simulate();
            render();
            animationRef.current = requestAnimationFrame(animate);
        };

        animate();
    }, [stop, init, clearFBOs, initDensity, simulate, render]);

    const updateIntensity = useCallback((value) => {
        intensityRef.current = value;
    }, []);

    const updateColors = useCallback((colors) => {
        colorsRef.current = colors;
    }, []);

    const cleanup = useCallback(() => {
        const gl = glRef.current;
        if (!gl || contextLostRef.current) return;

        Object.values(programsRef.current).forEach(p => {
            if (p) gl.deleteProgram(p);
        });

        Object.values(fbosRef.current).forEach(fbo => {
            if (fbo) {
                gl.deleteFramebuffer(fbo.read.framebuffer);
                gl.deleteFramebuffer(fbo.write.framebuffer);
                gl.deleteTexture(fbo.read.texture);
                gl.deleteTexture(fbo.write.texture);
            }
        });

        if (quadRef.current) gl.deleteBuffer(quadRef.current);
    }, []);

    useEffect(() => {
        return () => {
            stop();
            cleanup();
        };
    }, [stop, cleanup]);

    return { start, stop, updateIntensity, updateColors };
}
