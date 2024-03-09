import { Action } from "./Action";

class UndoManager {
    private static _instance: UndoManager;
    private static _actionStack: Action[] = [];

    public static get instance(): UndoManager {
        if (!UndoManager._instance) {
            UndoManager._instance = new UndoManager();
        }
        return UndoManager._instance;
    }

    public static do(action: Action) {
        action.execute();
        this._actionStack.push(action);
    }

    public static undo() {
        const action = this._actionStack.pop();
        if (action) {
            action.undo();
        }
    }
}

export { UndoManager };
