import * as SPLAT from "gsplat";

class SelectionManager {
    private static _instance: SelectionManager;

    private static _selectedSplat: SPLAT.Splat | null = null;

    public static get instance(): SelectionManager {
        if (!SelectionManager._instance) {
            SelectionManager._instance = new SelectionManager();
        }
        return SelectionManager._instance;
    }

    public static get selectedSplat(): SPLAT.Splat | null {
        return this._selectedSplat;
    }

    public static set selectedSplat(splat: SPLAT.Splat | null) {
        if (this._selectedSplat) {
            this._selectedSplat.selected = false;
        }
        this._selectedSplat = splat;
        if (this._selectedSplat) {
            this._selectedSplat.selected = true;
        }
    }
}

export { SelectionManager };
