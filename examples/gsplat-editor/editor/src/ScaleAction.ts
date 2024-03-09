import * as SPLAT from "gsplat";
import { Action } from "./Action";

class ScaleAction implements Action {
    private _object: SPLAT.Splat;
    private _oldScale: SPLAT.Vector3;
    private _newScale: SPLAT.Vector3;

    constructor(object: SPLAT.Splat, oldScale: SPLAT.Vector3, newScale: SPLAT.Vector3) {
        this._object = object;
        this._oldScale = oldScale;
        this._newScale = newScale;
    }

    execute(): void {
        this._object.scale = this._newScale;
    }

    undo(): void {
        this._object.scale = this._oldScale;
    }
}

export { ScaleAction };
