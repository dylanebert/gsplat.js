import { InputMode } from "./InputMode";

class ModeManager {
    private static _instance: ModeManager;

    private static _modeFactories: Map<string, () => InputMode> = new Map();
    private static _currentMode: InputMode | null = null;

    public static get instance(): ModeManager {
        if (!ModeManager._instance) {
            ModeManager._instance = new ModeManager();
        }
        return ModeManager._instance;
    }

    public static registerMode(name: string, factory: () => InputMode) {
        this._modeFactories.set(name, factory);
    }

    public static enterMode(name: string) {
        const factory = this._modeFactories.get(name);
        if (factory) {
            this._currentMode?.exit();
            this._currentMode = factory();
        } else {
            console.error(`No mode registered with name ${name}.`);
        }
    }

    public static exitCurrentMode() {
        this._currentMode?.exit();
        this._currentMode = null;
    }
}

export { ModeManager };
