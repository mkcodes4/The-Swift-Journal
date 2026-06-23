'use client';

import React, { useEffect, useRef } from 'react';

const BackgroundShader: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
        if (!gl) return;

        const vs = `
      attribute vec2 a_position;
      varying vec2 v_texCoord;
      void main() {
        v_texCoord = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

        const fs = `
      precision highp float;
      varying vec2 v_texCoord;
      uniform float u_time;
      uniform vec2 u_resolution;

      void main() {
          vec2 uv = v_texCoord;
          float t = u_time * 0.15;
          
          // Eras-inspired palette
          vec3 lover = vec3(0.95, 0.76, 0.84);
          vec3 midnights = vec3(0.12, 0.16, 0.29);
          vec3 folklore = vec3(0.85, 0.82, 0.75);
          vec3 red = vec3(0.55, 0.05, 0.05);
          
          // Subtle fluid movement
          float n1 = sin(uv.x * 2.0 + t) * cos(uv.y * 1.5 - t * 0.5);
          float n2 = sin(uv.y * 3.0 - t * 0.8) * cos(uv.x * 2.5 + t * 0.3);
          
          vec3 color = mix(lover, midnights, uv.y + n1 * 0.1);
          color = mix(color, folklore, uv.x + n2 * 0.15);
          color = mix(color, red, (1.0 - uv.y) * 0.3 + n1 * 0.05);
          
          // Vintage film grain
          float grain = (fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * 0.05;
          color += grain;
          
          // Soft vignette to focus on center content
          float dist = distance(uv, vec2(0.5));
          color *= smoothstep(1.3, 0.4, dist);

          gl_FragColor = vec4(color, 1.0);
      }
    `;

        function createShader(gl: WebGLRenderingContext, type: number, source: string) {
            const shader = gl.createShader(type);
            if (!shader) return null;
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error(gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        }

        const program = gl.createProgram();
        if (!program) return;
        const vertexShader = createShader(gl, gl.VERTEX_SHADER, vs);
        const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fs);
        if (!vertexShader || !fragmentShader) return;

        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        gl.useProgram(program);

        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

        const positionLocation = gl.getAttribLocation(program, 'a_position');
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        const uTime = gl.getUniformLocation(program, 'u_time');
        const uRes = gl.getUniformLocation(program, 'u_resolution');

        function syncSize() {
            if (!canvas) return;
            const w = canvas.clientWidth;
            const h = canvas.clientHeight;
            if (canvas.width !== w || canvas.height !== h) {
                canvas.width = w;
                canvas.height = h;
                gl!.viewport(0, 0, canvas.width, canvas.height);
            }
        }

        window.addEventListener('resize', syncSize);
        syncSize();

        let animationId: number;
        function render(t: number) {
            if (uTime) gl!.uniform1f(uTime, t * 0.001);
            if (uRes) gl!.uniform2f(uRes, canvas!.width, canvas!.height);
            gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
            animationId = requestAnimationFrame(render);
        }
        render(0);

        return () => {
            window.removeEventListener('resize', syncSize);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="block w-full h-full"
        />
    );
};

export default BackgroundShader;
