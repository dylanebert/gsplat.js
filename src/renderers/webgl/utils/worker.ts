import { Scene } from "../../../core/Scene";
import { Matrix4 } from "../../../math/Matrix4";
import loadWasm from "../../../wasm/sort";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let wasmModule: any;

async function initWasm() {
    wasmModule = await loadWasm();
}

let scene: Scene;
let viewProj: Matrix4;
let sortRunning = false;

let viewProjPtr: number;
let fBufferPtr: number;
let uBufferPtr: number;
let depthBufferPtr: number;
let depthIndexPtr: number;
let startsPtr: number;

const _floatView: Float32Array = new Float32Array(1);
const _int32View: Int32Array = new Int32Array(_floatView.buffer);

function floatToHalf(float: number) {
    _floatView[0] = float;
    const f = _int32View[0];

    const sign = (f >> 31) & 0x0001;
    const exp = (f >> 23) & 0x00ff;
    let frac = f & 0x007fffff;

    let newExp;
    if (exp == 0) {
        newExp = 0;
    } else if (exp < 113) {
        newExp = 0;
        frac |= 0x00800000;
        frac = frac >> (113 - exp);
        if (frac & 0x01000000) {
            newExp = 1;
            frac = 0;
        }
    } else if (exp < 142) {
        newExp = exp - 112;
    } else {
        newExp = 31;
        frac = 0;
    }

    return (sign << 15) | (newExp << 10) | (frac >> 13);
}

function packHalf2x16(x: number, y: number) {
    return (floatToHalf(x) | (floatToHalf(y) << 16)) >>> 0;
}

const initScene = async () => {
    if (!wasmModule) await initWasm();

    const f_buffer = new Float32Array(scene.data.buffer);
    const u_buffer = new Uint8Array(scene.data.buffer);
    fBufferPtr = wasmModule._malloc(f_buffer.length * f_buffer.BYTES_PER_ELEMENT);
    uBufferPtr = wasmModule._malloc(u_buffer.length * u_buffer.BYTES_PER_ELEMENT);
    wasmModule.HEAPF32.set(f_buffer, fBufferPtr / 4);
    wasmModule.HEAPU8.set(u_buffer, uBufferPtr);

    viewProjPtr = wasmModule._malloc(16 * 4);
    depthBufferPtr = wasmModule._malloc(scene.vertexCount * 4);
    depthIndexPtr = wasmModule._malloc(scene.vertexCount * 4);
    startsPtr = wasmModule._malloc(scene.vertexCount * 4);

    const texwidth = 1024 * 2; // Set to your desired width
    const texheight = Math.ceil((2 * scene.vertexCount) / texwidth); // Set to your desired height
    const texdata = new Uint32Array(texwidth * texheight * 4); // 4 components per pixel (RGBA)
    const texdata_c = new Uint8Array(texdata.buffer);
    const texdata_f = new Float32Array(texdata.buffer);

    // Here we convert from a .splat file buffer into a texture
    // With a little bit more foresight perhaps this texture file
    // should have been the native format as it'd be very easy to
    // load it into webgl.
    for (let i = 0; i < scene.vertexCount; i++) {
        // x, y, z
        texdata_f[8 * i + 0] = f_buffer[8 * i + 0];
        texdata_f[8 * i + 1] = f_buffer[8 * i + 1];
        texdata_f[8 * i + 2] = f_buffer[8 * i + 2];

        // r, g, b, a
        texdata_c[4 * (8 * i + 7) + 0] = u_buffer[32 * i + 24 + 0];
        texdata_c[4 * (8 * i + 7) + 1] = u_buffer[32 * i + 24 + 1];
        texdata_c[4 * (8 * i + 7) + 2] = u_buffer[32 * i + 24 + 2];
        texdata_c[4 * (8 * i + 7) + 3] = u_buffer[32 * i + 24 + 3];

        // quaternions
        const scale = [f_buffer[8 * i + 3 + 0], f_buffer[8 * i + 3 + 1], f_buffer[8 * i + 3 + 2]];
        const rot = [
            (u_buffer[32 * i + 28 + 0] - 128) / 128,
            (u_buffer[32 * i + 28 + 1] - 128) / 128,
            (u_buffer[32 * i + 28 + 2] - 128) / 128,
            (u_buffer[32 * i + 28 + 3] - 128) / 128,
        ];

        // Compute the matrix product of S and R (M = S * R)
        const M = [
            1.0 - 2.0 * (rot[2] * rot[2] + rot[3] * rot[3]),
            2.0 * (rot[1] * rot[2] + rot[0] * rot[3]),
            2.0 * (rot[1] * rot[3] - rot[0] * rot[2]),

            2.0 * (rot[1] * rot[2] - rot[0] * rot[3]),
            1.0 - 2.0 * (rot[1] * rot[1] + rot[3] * rot[3]),
            2.0 * (rot[2] * rot[3] + rot[0] * rot[1]),

            2.0 * (rot[1] * rot[3] + rot[0] * rot[2]),
            2.0 * (rot[2] * rot[3] - rot[0] * rot[1]),
            1.0 - 2.0 * (rot[1] * rot[1] + rot[2] * rot[2]),
        ].map((k, i) => k * scale[Math.floor(i / 3)]);

        const sigma = [
            M[0] * M[0] + M[3] * M[3] + M[6] * M[6],
            M[0] * M[1] + M[3] * M[4] + M[6] * M[7],
            M[0] * M[2] + M[3] * M[5] + M[6] * M[8],
            M[1] * M[1] + M[4] * M[4] + M[7] * M[7],
            M[1] * M[2] + M[4] * M[5] + M[7] * M[8],
            M[2] * M[2] + M[5] * M[5] + M[8] * M[8],
        ];

        texdata[8 * i + 4] = packHalf2x16(4 * sigma[0], 4 * sigma[1]);
        texdata[8 * i + 5] = packHalf2x16(4 * sigma[2], 4 * sigma[3]);
        texdata[8 * i + 6] = packHalf2x16(4 * sigma[4], 4 * sigma[5]);
    }

    self.postMessage({ texdata, texwidth, texheight }, [texdata.buffer]);
};

const runSort = (viewProj: Matrix4) => {
    const viewProjBuffer = new Float32Array(viewProj.buffer);
    wasmModule.HEAPF32.set(viewProjBuffer, viewProjPtr / 4);
    wasmModule._sort(viewProjPtr, scene.vertexCount, fBufferPtr, uBufferPtr, depthBufferPtr, depthIndexPtr, startsPtr);
    const depthIndex = new Uint32Array(wasmModule.HEAPU32.buffer, depthIndexPtr, scene.vertexCount);
    const transferableDepthIndex = new Uint32Array(depthIndex.slice());
    self.postMessage({ depthIndex: transferableDepthIndex }, [transferableDepthIndex.buffer]);
};

const throttledSort = () => {
    if (!sortRunning) {
        sortRunning = true;
        const lastView = viewProj;
        runSort(lastView);
        setTimeout(() => {
            sortRunning = false;
            if (lastView !== viewProj) {
                throttledSort();
            }
        }, 0);
    }
};

self.onmessage = (e) => {
    if (e.data.scene) {
        scene = e.data.scene;
        initScene();
    }
    if (!scene || !wasmModule) return;
    if (e.data.viewProj) {
        viewProj = e.data.viewProj;
        throttledSort();
    }
};
