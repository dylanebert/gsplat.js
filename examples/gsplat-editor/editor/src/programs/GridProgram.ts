import * as SPLAT from "gsplat";

const gridVertexShader = /*glsl*/ `#version 300 es
uniform mat4 projection, view;
uniform vec2 viewport;

in vec2 position;

void main() {
    int numLines = 100;
    float lineOffset = float(gl_VertexID / 4 - numLines / 2);
    vec4 worldPosition;

    if (gl_VertexID % 4 == 0) {
        worldPosition = view * vec4(-50, 0.0, lineOffset, 1.0);
    } else if (gl_VertexID % 4 == 1) {
        worldPosition = view * vec4(50, 0.0, lineOffset, 1.0);
    } else if (gl_VertexID % 4 == 2) {
        worldPosition = view * vec4(lineOffset, 0.0, -50, 1.0);
    } else {
        worldPosition = view * vec4(lineOffset, 0.0, 50, 1.0);
    }

    gl_Position = projection * worldPosition;
}
`;

const gridFragmentShader = /*glsl*/ `#version 300 es
    precision mediump float;
    out vec4 outColor;

    void main() {
        outColor = vec4(1.0, 1.0, 1.0, 0.1);
    }
`;

class GridProgram extends SPLAT.ShaderProgram {
    protected _initialize: () => void;
    protected _resize: () => void;
    protected _render: () => void;
    protected _dispose: () => void;

    constructor(renderer: SPLAT.WebGLRenderer, passes: SPLAT.ShaderPass[]) {
        super(renderer, passes);

        const gl = renderer.gl;

        let u_projection: WebGLUniformLocation;
        let u_view: WebGLUniformLocation;
        let u_viewport: WebGLUniformLocation;

        this._initialize = () => {
            u_projection = gl.getUniformLocation(this.program, "projection") as WebGLUniformLocation;
            u_view = gl.getUniformLocation(this.program, "view") as WebGLUniformLocation;
            u_viewport = gl.getUniformLocation(this.program, "viewport") as WebGLUniformLocation;
        };

        this._resize = () => {
            gl.uniform2fv(u_viewport, new Float32Array([renderer.canvas.width, renderer.canvas.height]));
        };

        this._render = () => {
            if (!this._camera) {
                throw new Error("Camera not set");
            }

            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

            gl.uniformMatrix4fv(u_projection, false, this._camera.data.projectionMatrix.buffer);
            gl.uniformMatrix4fv(u_view, false, this._camera.data.viewMatrix.buffer);

            gl.drawArrays(gl.LINES, 0, 400);
        };

        this._dispose = () => {};
    }

    protected _getVertexSource() {
        return gridVertexShader;
    }

    protected _getFragmentSource() {
        return gridFragmentShader;
    }
}

export { GridProgram };
