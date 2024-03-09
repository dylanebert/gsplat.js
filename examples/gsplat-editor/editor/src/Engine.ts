import * as SPLAT from "gsplat";
import { OrbitControls } from "./OrbitControls";
import { GridProgram } from "./programs/GridProgram";
import { AxisProgram } from "./programs/AxisProgram";
import { ModeManager } from "./ModeManager";
import { Controls } from "./Controls";
import { MouseManager } from "./MouseManager";
import { KeyboardManager } from "./KeyboardManager";
import { DefaultMode } from "./DefaultMode";
import { GrabMode } from "./GrabMode";
import { RotateMode } from "./RotateMode";
import { ScaleMode } from "./ScaleMode";

class Engine {
    private _scene: SPLAT.Scene;
    private _camera: SPLAT.Camera;
    private _renderer: SPLAT.WebGLRenderer;
    private _orbitControls: OrbitControls;
    private _intersectionTester: SPLAT.IntersectionTester;
    private _keyboardManager: KeyboardManager;
    private _mouseManager: MouseManager;

    constructor(canvas: HTMLCanvasElement) {
        this._scene = new SPLAT.Scene();
        this._camera = new SPLAT.Camera();
        this._camera.data.setSize(canvas.clientWidth, canvas.clientHeight);

        this._renderer = new SPLAT.WebGLRenderer(canvas);
        this._renderer.addProgram(new AxisProgram(this._renderer, []));
        this._renderer.addProgram(new GridProgram(this._renderer, []));
        this._orbitControls = new OrbitControls(this._camera, canvas);
        this._intersectionTester = new SPLAT.IntersectionTester(this._renderer.renderProgram);

        this._keyboardManager = new KeyboardManager();
        this._mouseManager = new MouseManager(canvas);
        new Controls([this._keyboardManager, this._mouseManager], canvas);

        ModeManager.registerMode("default", () => new DefaultMode(this));
        ModeManager.registerMode("grab", () => new GrabMode(this));
        ModeManager.registerMode("rotate", () => new RotateMode(this));
        ModeManager.registerMode("scale", () => new ScaleMode(this));
        ModeManager.enterMode("default");
    }

    update() {
        this._orbitControls.update();
        this._renderer.render(this._scene, this._camera);
    }

    get scene(): SPLAT.Scene {
        return this._scene;
    }

    get camera(): SPLAT.Camera {
        return this._camera;
    }

    get renderer(): SPLAT.WebGLRenderer {
        return this._renderer;
    }

    get orbitControls(): OrbitControls {
        return this._orbitControls;
    }

    get intersectionTester(): SPLAT.IntersectionTester {
        return this._intersectionTester;
    }

    get keyboardManager(): KeyboardManager {
        return this._keyboardManager;
    }

    get mouseManager(): MouseManager {
        return this._mouseManager;
    }
}

export { Engine };
