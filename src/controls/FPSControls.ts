import { Camera } from "../cameras/Camera";
import { Quaternion } from "../math/Quaternion";
import { Matrix3 } from "../math/Matrix3";
import { Vector3 } from "../math/Vector3";

class FPSControls {
    moveSpeed: number = 2.0;
    lookSpeed: number = 0.7;
    dampening: number = 0.5;
    update: () => void;
    dispose: () => void;

    constructor(camera: Camera, canvas: HTMLCanvasElement) {
        const keys: { [key: string]: boolean } = {};
        let pitch = camera.rotation.toEuler().x;
        let yaw = camera.rotation.toEuler().y;
        let targetPosition = camera.position;
        let pointerLock = false;

        const onMouseDown = () => {
            canvas.requestPointerLock();
        };

        const onPointerLockChange = () => {
            pointerLock = document.pointerLockElement === canvas;
            if (pointerLock) {
                canvas.addEventListener("mousemove", onMouseMove);
            } else {
                canvas.removeEventListener("mousemove", onMouseMove);
            }
        };

        const onMouseMove = (e: MouseEvent) => {
            const mouseX = e.movementX;
            const mouseY = e.movementY;

            yaw += mouseX * this.lookSpeed * 0.001;
            pitch -= mouseY * this.lookSpeed * 0.001;
            pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));
        };

        const onKeyDown = (e: KeyboardEvent) => {
            keys[e.code] = true;
            // Map arrow keys to WASD keys
            if (e.code === "ArrowUp") keys["KeyW"] = true;
            if (e.code === "ArrowDown") keys["KeyS"] = true;
            if (e.code === "ArrowLeft") keys["KeyA"] = true;
            if (e.code === "ArrowRight") keys["KeyD"] = true;
        };

        const onKeyUp = (e: KeyboardEvent) => {
            keys[e.code] = false;
            // Map arrow keys to WASD keys
            if (e.code === "ArrowUp") keys["KeyW"] = false;
            if (e.code === "ArrowDown") keys["KeyS"] = false;
            if (e.code === "ArrowLeft") keys["KeyA"] = false;
            if (e.code === "ArrowRight") keys["KeyD"] = false;
            if (e.code === "Escape") document.exitPointerLock();
        };

        this.update = () => {
            const R = Matrix3.RotationFromQuaternion(camera.rotation).buffer;
            const forward = new Vector3(-R[2], -R[5], -R[8]);
            const right = new Vector3(R[0], R[3], R[6]);
            let move = new Vector3(0, 0, 0);
            if (keys["KeyS"]) {
                move = move.add(forward);
            }
            if (keys["KeyW"]) {
                move = move.subtract(forward);
            }
            if (keys["KeyA"]) {
                move = move.subtract(right);
            }
            if (keys["KeyD"]) {
                move = move.add(right);
            }
            move = new Vector3(move.x, 0, move.z);
            if (move.magnitude() > 0) {
                move = move.normalize();
            }

            targetPosition = targetPosition.add(move.multiply(this.moveSpeed * 0.01));
            camera.position = camera.position.add(targetPosition.subtract(camera.position).multiply(this.dampening));

            camera.rotation = Quaternion.FromEuler(new Vector3(pitch, yaw, 0));
        };

        const preventDefault = (e: Event) => {
            e.preventDefault();
            e.stopPropagation();
        };

        this.dispose = () => {
            canvas.removeEventListener("dragenter", preventDefault);
            canvas.removeEventListener("dragover", preventDefault);
            canvas.removeEventListener("dragleave", preventDefault);
            canvas.removeEventListener("contextmenu", preventDefault);
            canvas.removeEventListener("mousedown", onMouseDown);

            document.removeEventListener("pointerlockchange", onPointerLockChange);

            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("keyup", onKeyUp);
        };

        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("keyup", onKeyUp);

        canvas.addEventListener("dragenter", preventDefault);
        canvas.addEventListener("dragover", preventDefault);
        canvas.addEventListener("dragleave", preventDefault);
        canvas.addEventListener("contextmenu", preventDefault);
        canvas.addEventListener("mousedown", onMouseDown);

        document.addEventListener("pointerlockchange", onPointerLockChange);

        this.update();
    }
}

export { FPSControls };
