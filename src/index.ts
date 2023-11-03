export { Camera } from "./cameras/Camera";
export { Scene } from "./core/Scene";
export { Loader } from "./loaders/Loader";
export { WebGLRenderer } from "./renderers/WebGLRenderer";
export { OrbitControls } from "./controls/OrbitControls";
export { Quaternion } from "./math/Quaternion";
export { Vector3 } from "./math/Vector3";
export { Matrix4 } from "./math/Matrix4";
export { Matrix3 } from "./math/Matrix3";

import loadWasm from "./wasm/hello";

export const hello = async () => {
    const wasm = await loadWasm();
    wasm._hello();
};
