import { InputHandler } from "./InputHandler";

class KeyboardManager implements InputHandler {
    private _keyMap: Map<string, (event: KeyboardEvent) => void>;

    constructor() {
        this._keyMap = new Map();
    }

    registerKey(key: string, callback: (event: KeyboardEvent) => void) {
        this._keyMap.set(key, callback);
    }

    unregisterKey(key: string) {
        this._keyMap.delete(key);
    }

    handleInput(event: KeyboardEvent) {
        const callback = this._keyMap.get(event.key);
        if (callback) {
            callback(event);
        }
    }
}

export { KeyboardManager };
