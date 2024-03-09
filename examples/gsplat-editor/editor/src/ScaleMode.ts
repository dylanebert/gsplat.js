import * as SPLAT from "gsplat";
import { InputMode } from "./InputMode";
import { Engine } from "./Engine";
import { ModeManager } from "./ModeManager";
import { SelectionManager } from "./SelectionManager";
import { UndoManager } from "./UndoManager";
import { ScaleAction } from "./ScaleAction";

class ScaleMode implements InputMode {
    exit: () => void;

    constructor(engine: Engine) {
        const splat = SelectionManager.selectedSplat as SPLAT.Splat;
        const initialMousePosition = engine.mouseManager.currentMousePosition.clone();
        const initialScale = splat.scale.clone();

        let axis: "x" | "y" | "z" | null = null;

        const handleClick = () => {
            const action = new ScaleAction(splat, initialScale, splat.scale);
            UndoManager.do(action);
            ModeManager.enterMode("default");
        };

        const handleCancel = () => {
            splat.scale = initialScale;
            ModeManager.enterMode("default");
        };

        const handleMouseMove = () => {
            const plane = new SPLAT.Plane(engine.camera.forward, splat.position);
            const initialDirection = engine.camera.screenPointToRay(initialMousePosition.x, initialMousePosition.y);
            const newDirection = engine.camera.screenPointToRay(
                engine.mouseManager.currentMousePosition.x,
                engine.mouseManager.currentMousePosition.y,
            );
            const initialIntersection = plane.intersect(engine.camera.position, initialDirection);
            const newIntersection = plane.intersect(engine.camera.position, newDirection);
            if (initialIntersection && newIntersection) {
                const initialDistance = initialIntersection.subtract(splat.position).magnitude();
                const distance = newIntersection.subtract(splat.position).magnitude();
                const scaleRatio = distance / initialDistance;
                let scaleAxis = SPLAT.Vector3.One();
                switch (axis) {
                    case "x":
                        scaleAxis = new SPLAT.Vector3(1, 0, 0);
                        break;
                    case "y":
                        scaleAxis = new SPLAT.Vector3(0, 1, 0);
                        break;
                    case "z":
                        scaleAxis = new SPLAT.Vector3(0, 0, 1);
                        break;
                }
                scaleAxis = splat.rotation.apply(scaleAxis);
                scaleAxis = new SPLAT.Vector3(Math.abs(scaleAxis.x), Math.abs(scaleAxis.y), Math.abs(scaleAxis.z));
                const scaling = scaleAxis.multiply(scaleRatio).add(SPLAT.Vector3.One().subtract(scaleAxis));
                splat.scale = initialScale.multiply(scaling);
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
        engine.keyboardManager.registerKey("s", handleCancel);
        engine.keyboardManager.registerKey("x", handleAxisX);
        engine.keyboardManager.registerKey("y", handleAxisY);
        engine.keyboardManager.registerKey("z", handleAxisZ);

        this.exit = () => {
            engine.mouseManager.unregisterMouse("click");
            engine.mouseManager.unregisterMouse("contextmenu");
            engine.mouseManager.unregisterMouse("mousemove");
            engine.keyboardManager.unregisterKey("Escape");
            engine.keyboardManager.unregisterKey("s");
            engine.keyboardManager.unregisterKey("x");
            engine.keyboardManager.unregisterKey("y");
            engine.keyboardManager.unregisterKey("z");
        };
    }
}

export { ScaleMode };
