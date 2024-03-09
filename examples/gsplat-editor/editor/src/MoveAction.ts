import * as SPLAT from "gsplat";
import { Action } from "./Action";

class MoveAction implements Action {
    private _object: SPLAT.Splat;
    private _oldPosition: SPLAT.Vector3;
    private _newPosition: SPLAT.Vector3;

    constructor(object: SPLAT.Splat, oldPosition: SPLAT.Vector3, newPosition: SPLAT.Vector3) {
        this._object = object;
        this._oldPosition = oldPosition;
        this._newPosition = newPosition;
    }

    execute(): void {
        this._object.position = this._newPosition;
    }

    undo(): void {
        this._object.position = this._oldPosition;
    }
}

export { MoveAction };
