"use client";

import { useEffect, useRef } from "react";

// Rectangle of the artwork (fractions of its width/height) that contains the cloak.
// The effect fades to zero at this rectangle's border, so there is never a visible seam.
export const CLOAK = { x: 0.06, y: 0.26, w: 0.26, h: 0.46 };
const SRC = "/landing.png";

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5); // y runs top -> bottom
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

// Wind model: waves travel along the cloth, strength grows with distance from the body
// (the body edge sits near x = 0.285) and with a slow gust envelope.
const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform sampler2D uTex;
uniform vec4 uRect;
uniform float uTime;
uniform float uAmp;
varying vec2 vUv;

void main() {
  vec2 p = uRect.xy + vUv * uRect.zw;

  float away = clamp((0.285 - p.x) / 0.17, 0.0, 1.0);
  away = away * away * (3.0 - 2.0 * away);
  float hang = mix(0.35, 1.0, smoothstep(0.28, 0.55, p.y)) * (1.0 - smoothstep(0.65, 0.72, p.y));
  vec2 e = min(vUv, 1.0 - vUv);
  float edge = smoothstep(0.0, 0.14, e.x) * smoothstep(0.0, 0.12, e.y);
  float w = away * hang * edge * uAmp;

  float t = uTime;
  float gust = 0.7 + 0.35 * sin(t * 0.55) + 0.22 * sin(t * 1.37 + 1.7);
  float k = p.x * 46.0;
  float dy = sin(k + p.y * 18.0 + t * 2.6) * 0.010 + sin(k * 1.9 - p.y * 30.0 + t * 4.1) * 0.004;
  float dx = sin(t * 0.9 + p.y * 14.0) * 0.006 + sin(p.y * 40.0 + k * 0.8 + t * 3.3) * 0.0028;
  vec2 d = vec2(dx * (0.6 + 0.4 * gust) + gust * 0.008, dy * (0.6 + 0.4 * gust)) * w;

  gl_FragColor = vec4(texture2D(uTex, p + d).rgb, 1.0);
}`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type);
  if (!s) return null;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    gl.deleteShader(s);
    return null;
  }
  return s;
}

export default function CloakWind() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      powerPreference: "low-power",
    });
    if (!gl) return; // no WebGL: the still artwork underneath simply stays

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    const prog = gl.createProgram();
    if (!vs || !fs || !prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, "uTime");
    const uAmp = gl.getUniformLocation(prog, "uAmp");
    gl.uniform4f(gl.getUniformLocation(prog, "uRect"), CLOAK.x, CLOAK.y, CLOAK.w, CLOAK.h);

    const tex = gl.createTexture();
    let alive = true;
    let raf = 0;
    let inView = true;
    let shown = false;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([en]) => {
      inView = en.isIntersecting;
    });
    io.observe(canvas);

    const onLost = (e: Event) => {
      e.preventDefault();
      alive = false;
      canvas.style.opacity = "0"; // fall back to the still artwork
    };
    canvas.addEventListener("webglcontextlost", onLost);

    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      if (!alive) return;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      resize();

      const t0 = performance.now();
      const frame = (now: number) => {
        if (!alive) return;
        raf = requestAnimationFrame(frame);
        if (document.hidden || !inView) return;
        const t = (now - t0) / 1000;
        gl.uniform1f(uTime, t);
        gl.uniform1f(uAmp, Math.min(1, t / 2.5)); // ease in so it starts seamlessly
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        if (!shown) {
          shown = true;
          canvas.style.opacity = "1";
        }
      };
      raf = requestAnimationFrame(frame);
    };
    img.src = SRC;

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener("webglcontextlost", onLost);
      gl.deleteTexture(tex);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute transition-opacity duration-700"
      style={{
        left: `${CLOAK.x * 100}%`,
        top: `${CLOAK.y * 100}%`,
        width: `${CLOAK.w * 100}%`,
        height: `${CLOAK.h * 100}%`,
        opacity: 0,
      }}
    />
  );
}
