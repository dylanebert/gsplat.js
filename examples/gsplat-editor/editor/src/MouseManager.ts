import * as SPLAT from "gsplat";
import { InputHandler } from "./InputHandler";

class MouseManager implements InputHandler {
    private _canvas: HTMLCanvasElement;
    private _mouseMap: Map<string, (event: MouseEvent) => void>;
    private _currentMousePosition: SPLAT.Vector3;

    constructor(canvas: HTMLCanvasElement) {
        this._canvas = canvas;
        this._mouseMap = new Map();
        this._currentMousePosition = new SPLAT.Vector3();
    }

    registerMouse(key: string, callback: (event: MouseEvent) => void) {
        this._mouseMap.set(key, callback);
    }

    unregisterMouse(key: string) {
        this._mouseMap.delete(key);
    }

    handleInput(event: MouseEvent) {
        const x = (event.clientX / this._canvas.clientWidth) * 2 - 1;
        const y = -(event.clientY / this._canvas.clientHeight) * 2 + 1;
        this._currentMousePosition = new SPLAT.Vector3(x, y, 0);
        const callback = this._mouseMap.get(event.type);
        if (callback) {
            callback(event);
        }
    }

    get currentMousePosition(): SPLAT.Vector3 {
        return this._currentMousePosition;
    }
}

export { MouseManager };
