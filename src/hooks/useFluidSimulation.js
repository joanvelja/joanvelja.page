'use client';

import { useRef, useCallback, useEffect } from 'react';

const SIM_RESOLUTION = 64;

const baseVertex = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const displayFragment = `
precision highp float;
uniform sampler2D u_texture;
uniform float u_intensity;
uniform float u_time;
uniform vec3 u_hotColor;
uniform vec3 u_coldColor;
uniform vec3 u_equilibriumColor;
varying vec2 v_uv;

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 4; i++) {
        value += amplitude * noise(p);
        p *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

void main() {
    vec4 tex = texture2D(u_texture, v_uv);
    float temperature = tex.r - tex.b;
    float activity = length(tex.rgb);
    
    // Add procedural flow based on time
    vec2 flowUV = v_uv + vec2(u_time * 0.05, u_time * 0.03);
    float flow = fbm(flowUV * 4.0);
    activity = max(activity, flow * 0.3 * u_intensity);
    temperature += (flow - 0.5) * 0.5 * u_intensity;
    
    vec3 hotCold;
    if (temperature > 0.0) {
        hotCold = mix(u_equilibriumColor, u_hotColor, min(temperature * 2.0, 1.0));
    } else {
        hotCold = mix(u_equilibriumColor, u_coldColor, min(-temperature * 2.0, 1.0));
    }
    
    float mixFactor = clamp(activity * 3.0, 0.0, 1.0);
    vec3 finalColor = mix(u_equilibriumColor, hotCold, mixFactor * u_intensity);
    
    gl_FragColor = vec4(finalColor, u_intensity * mixFactor * 0.9);
}
`;

const advectionFragment = `
precision highp float;
uniform sampler2D u_velocity;
uniform sampler2D u_source;
uniform vec2 u_texelSize;
uniform float u_dt;
uniform float u_dissipation;
varying vec2 v_uv;

void main() {
    vec2 vel = texture2D(u_velocity, v_uv).xy * 2.0 - 1.0;
    vec2 prevPos = v_uv - vel * u_dt * u_texelSize * 10.0;
    vec4 result = u_dissipation * texture2D(u_source, prevPos);
    gl_FragColor = result;
}
`;

const addForceFragment = `
precision highp float;
uniform sampler2D u_velocity;
uniform vec2 u_point;
uniform vec2 u_force;
uniform float u_radius;
varying vec2 v_uv;

void main() {
    vec2 vel = texture2D(u_velocity, v_uv).xy * 2.0 - 1.0;
    float d = distance(v_uv, u_point);
    float influence = exp(-d * d / u_radius);
    vel += u_force * influence;
    vel = vel * 0.5 + 0.5;
    gl_FragColor = vec4(vel, 0.5, 1.0);
}
`;

const addDensityFragment = `
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
    density += u_color * influence * 0.5;
    density = clamp(density, 0.0, 1.0);
    gl_FragColor = vec4(density, 1.0);
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

function createTexture(gl, width, height) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    return texture;
}

function createFramebuffer(gl, texture) {
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status !== gl.FRAMEBUFFER_COMPLETE) {
        console.error('Framebuffer incomplete:', status);
    }

    return fb;
}

function createDoubleFBO(gl, width, height) {
    const texA = createTexture(gl, width, height);
    const texB = createTexture(gl, width, height);
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
    const timeRef = useRef(0);
    const intensityRef = useRef(0);
    const quadRef = useRef(null);
    const initializedRef = useRef(false);

    const init = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || initializedRef.current) return true;

        const gl = canvas.getContext('webgl', {
            premultipliedAlpha: false,
            alpha: true,
            preserveDrawingBuffer: true
        });
        if (!gl) {
            console.error('WebGL not supported');
            return false;
        }

        glRef.current = gl;
        initializedRef.current = true;

        programsRef.current = {
            advection: createProgram(gl, baseVertex, advectionFragment),
            addForce: createProgram(gl, baseVertex, addForceFragment),
            addDensity: createProgram(gl, baseVertex, addDensityFragment),
            display: createProgram(gl, baseVertex, displayFragment),
        };

        for (const [name, prog] of Object.entries(programsRef.current)) {
            if (!prog) {
                console.error(`Failed to create program: ${name}`);
                return false;
            }
        }

        fbosRef.current = {
            velocity: createDoubleFBO(gl, SIM_RESOLUTION, SIM_RESOLUTION),
            density: createDoubleFBO(gl, SIM_RESOLUTION, SIM_RESOLUTION),
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

        if (target) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, target);
        } else {
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        }
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }, []);

    const useProgram = useCallback((program) => {
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

    const step = useCallback((dt) => {
        const gl = glRef.current;
        const progs = programsRef.current;
        const fbos = fbosRef.current;
        if (!gl || !progs.advection) return;

        const texelSize = [1.0 / SIM_RESOLUTION, 1.0 / SIM_RESOLUTION];

        gl.viewport(0, 0, SIM_RESOLUTION, SIM_RESOLUTION);

        let setUniform = useProgram(progs.advection);
        bindTexture(0, fbos.velocity.read.texture, 'u_velocity', progs.advection);
        bindTexture(1, fbos.velocity.read.texture, 'u_source', progs.advection);
        setUniform('u_texelSize', texelSize);
        setUniform('u_dt', dt);
        setUniform('u_dissipation', 0.98);
        blit(fbos.velocity.write.framebuffer);
        fbos.velocity.swap();

        setUniform = useProgram(progs.advection);
        bindTexture(0, fbos.velocity.read.texture, 'u_velocity', progs.advection);
        bindTexture(1, fbos.density.read.texture, 'u_source', progs.advection);
        setUniform('u_texelSize', texelSize);
        setUniform('u_dt', dt);
        setUniform('u_dissipation', 0.97);
        blit(fbos.density.write.framebuffer);
        fbos.density.swap();
    }, [useProgram, bindTexture, blit]);

    const injectForce = useCallback((x, y, fx, fy, radius = 0.02) => {
        const gl = glRef.current;
        const progs = programsRef.current;
        const fbos = fbosRef.current;
        if (!gl) return;

        gl.viewport(0, 0, SIM_RESOLUTION, SIM_RESOLUTION);

        const setUniform = useProgram(progs.addForce);
        bindTexture(0, fbos.velocity.read.texture, 'u_velocity', progs.addForce);
        setUniform('u_point', [x, y]);
        setUniform('u_force', [fx, fy]);
        setUniform('u_radius', radius);
        blit(fbos.velocity.write.framebuffer);
        fbos.velocity.swap();
    }, [useProgram, bindTexture, blit]);

    const injectDensity = useCallback((x, y, r, g, b, radius = 0.03) => {
        const gl = glRef.current;
        const progs = programsRef.current;
        const fbos = fbosRef.current;
        if (!gl) return;

        gl.viewport(0, 0, SIM_RESOLUTION, SIM_RESOLUTION);

        const setUniform = useProgram(progs.addDensity);
        bindTexture(0, fbos.density.read.texture, 'u_density', progs.addDensity);
        setUniform('u_point', [x, y]);
        setUniform('u_color', [r, g, b]);
        setUniform('u_radius', radius);
        blit(fbos.density.write.framebuffer);
        fbos.density.swap();
    }, [useProgram, bindTexture, blit]);

    const render = useCallback((colors) => {
        const gl = glRef.current;
        const progs = programsRef.current;
        const fbos = fbosRef.current;
        if (!gl) return;

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        const intensity = intensityRef.current;

        const setUniform = useProgram(progs.display);
        bindTexture(0, fbos.density.read.texture, 'u_texture', progs.display);
        setUniform('u_intensity', intensity);
        setUniform('u_time', timeRef.current);
        setUniform('u_hotColor', colors.hot);
        setUniform('u_coldColor', colors.cold);
        setUniform('u_equilibriumColor', colors.equilibrium);

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        blit(null);
        gl.disable(gl.BLEND);
    }, [useProgram, bindTexture, blit]);

    const start = useCallback((mode, colors) => {
        if (!init()) return;

        if (animationRef.current) return;

        const animate = () => {
            // Performance optimization: Skip frame when tab is hidden
            if (document.hidden) {
                animationRef.current = requestAnimationFrame(animate);
                return;
            }

            // Performance optimization: Skip heavy computation when intensity is very low
            const intensity = intensityRef.current;
            if (intensity < 0.01) {
                animationRef.current = requestAnimationFrame(animate);
                return;
            }

            const dt = 1 / 60;
            timeRef.current += dt;

            const angle = timeRef.current * 0.7;
            const cx = 0.5 + Math.sin(angle) * 0.25;
            const cy = 0.5 + Math.cos(angle * 0.8) * 0.25;
            const fx = Math.sin(timeRef.current * 2.3) * 0.15;
            const fy = Math.cos(timeRef.current * 1.9) * 0.15;

            injectForce(cx, cy, fx, fy, 0.025);
            injectDensity(0.3, 0.7, 1.0, 0.3, 0.0, 0.04);
            injectDensity(0.7, 0.3, 0.0, 0.3, 1.0, 0.04);

            step(dt);
            render(colors);
            animationRef.current = requestAnimationFrame(animate);
        };

        animate();
    }, [init, step, injectForce, injectDensity, render]);

    const stop = useCallback(() => {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }
    }, []);

    const updateIntensity = useCallback((value) => {
        intensityRef.current = value;
    }, []);

    useEffect(() => {
        return () => stop();
    }, [stop]);

    // Visibility change listener for potential pause/resume logic
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                // Tab is hidden - animation loop will skip frames automatically
                // Could add additional pause logic here if needed
            } else {
                // Tab is visible again - animation resumes automatically
                // Could add resume logic here if needed
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    return { start, stop, updateIntensity, init };
}
