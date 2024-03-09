import * as SPLAT from "gsplat";
import { InputMode } from "./InputMode";
import { Engine } from "./Engine";
import { ModeManager } from "./ModeManager";
import { SelectionManager } from "./SelectionManager";
import { UndoManager } from "./UndoManager";
import { MoveAction } from "./MoveAction";

class GrabMode implements InputMode {
    exit: () => void;

    constructor(engine: Engine) {
        const splat = SelectionManager.selectedSplat as SPLAT.Splat;
        const initialMousePosition = engine.mouseManager.currentMousePosition.clone();
        const initialPosition = splat.position.clone();

        let axis: "x" | "y" | "z" | null = null;

        const handleClick = () => {
            const action = new MoveAction(splat, initialPosition, splat.position);
            UndoManager.do(action);
            ModeManager.enterMode("default");
        };

        const handleCancel = () => {
            splat.position = initialPosition;
            ModeManager.enterMode("default");
        };

        const handleMouseMove = () => {
            const plane = new SPLAT.Plane(engine.camera.forward, initialPosition);
            const initialDirection = engine.camera.screenPointToRay(initialMousePosition.x, initialMousePosition.y);
            const newDirection = engine.camera.screenPointToRay(
                engine.mouseManager.currentMousePosition.x,
                engine.mouseManager.currentMousePosition.y,
            );
            const initialIntersection = plane.intersect(engine.camera.position, initialDirection);
            const newIntersection = plane.intersect(engine.camera.position, newDirection);
            if (initialIntersection && newIntersection) {
                let delta = newIntersection.subtract(initialIntersection);
                switch (axis) {
                    case "x":
                        delta = new SPLAT.Vector3(delta.x, 0, 0);
                        break;
                    case "y":
                        delta = new SPLAT.Vector3(0, delta.y, 0);
                        break;
                    case "z":
                        delta = new SPLAT.Vector3(0, 0, delta.z);
                        break;
                }
                splat.position = initialPosition.add(delta);
            }
        };

        const handleAxisX = () => {
            if (axis === "x") {
                axis = null;
            } else {
                axis = "x";
            }
            handleMouseMove();
        };

        const handleAxisY = () => {
            if (axis === "y") {
                axis = null;
            } else {
                axis = "y";
            }
            handleMouseMove();
        };

        const handleAxisZ = () => {
            if (axis === "z") {
                axis = null;
            } else {
                axis = "z";
            }
            handleMouseMove();
        };

        engine.mouseManager.registerMouse("click", handleClick);
        engine.mouseManager.registerMouse("contextmenu", handleCancel);
        engine.mouseManager.registerMouse("mousemove", handleMouseMove);
        engine.keyboardManager.registerKey("Escape", handleCancel);
        engine.keyboardManager.registerKey("g", handleCancel);
        engine.keyboardManager.registerKey("x", handleAxisX);
        engine.keyboardManager.registerKey("y", handleAxisY);
        engine.keyboardManager.registerKey("z", handleAxisZ);

        this.exit = () => {
            engine.mouseManager.unregisterMouse("click");
            engine.mouseManager.unregisterMouse("contextmenu");
            engine.mouseManager.unregisterMouse("mousemove");
            engine.keyboardManager.unregisterKey("Escape");
            engine.keyboardManager.unregisterKey("g");
            engine.keyboardManager.unregisterKey("x");
            engine.keyboardManager.unregisterKey("y");
            engine.keyboardManager.unregisterKey("z");
        };
    }
}

export { GrabMode };
