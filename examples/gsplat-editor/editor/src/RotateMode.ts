import * as SPLAT from "gsplat";
import { InputMode } from "./InputMode";
import { Engine } from "./Engine";
import { ModeManager } from "./ModeManager";
import { SelectionManager } from "./SelectionManager";
import { UndoManager } from "./UndoManager";
import { RotateAction } from "./RotateAction";

class RotateMode implements InputMode {
    exit: () => void;

    constructor(engine: Engine) {
        const splat = SelectionManager.selectedSplat as SPLAT.Splat;
        const initialMousePosition = engine.mouseManager.currentMousePosition.clone();
        const initialRotation = splat.rotation.clone();

        let axis: "x" | "y" | "z" | null = null;

        const handleClick = () => {
            const action = new RotateAction(splat, initialRotation, splat.rotation);
            UndoManager.do(action);
            ModeManager.enterMode("default");
        };

        const handleCancel = () => {
            splat.rotation = initialRotation;
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
                const initialVector = initialIntersection.subtract(splat.position).normalize();
                const newVector = newIntersection.subtract(splat.position).normalize();
                const cross = initialVector.cross(newVector);
                const dot = initialVector.dot(newVector);
                const delta = Math.acos(dot);
                let rotationAxis = cross.normalize();
                const sign = Math.sign(rotationAxis.dot(engine.camera.forward));
                switch (axis) {
                    case "x":
                        rotationAxis = new SPLAT.Vector3(1, 0, 0).multiply(sign);
                        break;
                    case "y":
                        rotationAxis = new SPLAT.Vector3(0, 1, 0).multiply(sign);
                        break;
                    case "z":
                        rotationAxis = new SPLAT.Vector3(0, 0, 1).multiply(sign);
                        break;
                }
                const rotation = SPLAT.Quaternion.FromAxisAngle(rotationAxis, delta);
                splat.rotation = rotation.multiply(initialRotation);
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
        engine.keyboardManager.registerKey("r", handleCancel);
        engine.keyboardManager.registerKey("x", handleAxisX);
        engine.keyboardManager.registerKey("y", handleAxisY);
        engine.keyboardManager.registerKey("z", handleAxisZ);

        this.exit = () => {
            engine.mouseManager.unregisterMouse("click");
            engine.mouseManager.unregisterMouse("contextmenu");
            engine.mouseManager.unregisterMouse("mousemove");
            engine.keyboardManager.unregisterKey("Escape");
            engine.keyboardManager.unregisterKey("r");
            engine.keyboardManager.unregisterKey("x");
            engine.keyboardManager.unregisterKey("y");
            engine.keyboardManager.unregisterKey("z");
        };
    }
}

export { RotateMode };
