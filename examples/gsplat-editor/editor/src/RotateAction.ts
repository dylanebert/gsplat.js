import * as SPLAT from "gsplat";
import { Action } from "./Action";

class RotateAction implements Action {
    private _object: SPLAT.Splat;
    private _oldRotation: SPLAT.Quaternion;
    private _newRotation: SPLAT.Quaternion;

    constructor(object: SPLAT.Splat, oldRotation: SPLAT.Quaternion, newRotation: SPLAT.Quaternion) {
        this._object = object;
        this._oldRotation = oldRotation;
        this._newRotation = newRotation;
    }

    execute(): void {
        this._object.rotation = this._newRotation;
    }

    undo(): void {
        this._object.rotation = this._oldRotation;
    }
}

export { RotateAction };
