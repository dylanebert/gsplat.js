import * as SPLAT from "gsplat";

class OrbitControls {
    public enabled: boolean = true;

    minAngle: number = -90;
    maxAngle: number = 90;
    minZoom: number = 0.1;
    maxZoom: number = 50;
    orbitSpeed: number = 1.75;
    panSpeed: number = 1.25;
    zoomSpeed: number = 2;
    dampening: number = 0.5;
    setCameraTarget: (newTarget: SPLAT.Vector3) => void = () => {};
    update: () => void;
    dispose: () => void;

    constructor(
        camera: SPLAT.Camera,
        canvas: HTMLElement,
        alpha: number = 0.5,
        beta: number = 0.5,
        radius: number = 13,
        inputTarget: SPLAT.Vector3 = new SPLAT.Vector3(),
    ) {
        let target = inputTarget.clone();

        let desiredTarget = target.clone();
        let desiredAlpha = alpha;
        let desiredBeta = beta;
        let desiredRadius = radius;

        let dragging = false;
        let panning = false;
        let lastDist = 0;
        let lastX = 0;
        let lastY = 0;

        let isUpdatingCamera = false;

        const onCameraChange = () => {
            if (isUpdatingCamera) return;

            const eulerRotation = camera.rotation.toEuler();
            desiredAlpha = -eulerRotation.y;
            desiredBeta = -eulerRotation.x;

            const x = camera.position.x - desiredRadius * Math.sin(desiredAlpha) * Math.cos(desiredBeta);
            const y = camera.position.y + desiredRadius * Math.sin(desiredBeta);
            const z = camera.position.z + desiredRadius * Math.cos(desiredAlpha) * Math.cos(desiredBeta);

            desiredTarget = new SPLAT.Vector3(x, y, z);
        };

        camera.addEventListener("objectChanged", onCameraChange);

        this.setCameraTarget = (newTarget: SPLAT.Vector3) => {
            const dx = newTarget.x - camera.position.x;
            const dy = newTarget.y - camera.position.y;
            const dz = newTarget.z - camera.position.z;
            desiredRadius = Math.sqrt(dx * dx + dy * dy + dz * dz);
            desiredBeta = Math.atan2(dy, Math.sqrt(dx * dx + dz * dz));
            desiredAlpha = -Math.atan2(dx, dz);
            desiredTarget = new SPLAT.Vector3(newTarget.x, newTarget.y, newTarget.z);
        };

        const computeZoomNorm = () => {
            return 0.1 + (0.9 * (desiredRadius - this.minZoom)) / (this.maxZoom - this.minZoom);
        };

        const onMouseDown = (e: MouseEvent) => {
            preventDefault(e);

            if (!this.enabled) return;

            if (e.button === 1) {
                dragging = true;
                panning = e.shiftKey;
                lastX = e.clientX;
                lastY = e.clientY;
            } else if (e.altKey && e.button === 0) {
                dragging = true;
                panning = false;
                lastX = e.clientX;
                lastY = e.clientY;
            } else if (e.altKey && e.button === 2) {
                dragging = true;
                panning = true;
                lastX = e.clientX;
                lastY = e.clientY;
            }
        };

        const onMouseUp = (e: MouseEvent) => {
            preventDefault(e);

            dragging = false;
            panning = false;
        };

        const onMouseMove = (e: MouseEvent) => {
            preventDefault(e);

            if (!this.enabled || !dragging || !camera) return;

            const dx = e.clientX - lastX;
            const dy = e.clientY - lastY;

            if (panning) {
                const zoomNorm = computeZoomNorm();
                const panX = -dx * this.panSpeed * 0.01 * zoomNorm;
                const panY = -dy * this.panSpeed * 0.01 * zoomNorm;
                const R = SPLAT.Matrix3.RotationFromQuaternion(camera.rotation).buffer;
                const right = new SPLAT.Vector3(R[0], R[3], R[6]);
                const up = new SPLAT.Vector3(R[1], R[4], R[7]);
                desiredTarget = desiredTarget.add(right.multiply(panX));
                desiredTarget = desiredTarget.add(up.multiply(panY));
            } else {
                desiredAlpha -= dx * this.orbitSpeed * 0.003;
                desiredBeta += dy * this.orbitSpeed * 0.003;
                desiredBeta = Math.min(
                    Math.max(desiredBeta, (this.minAngle * Math.PI) / 180),
                    (this.maxAngle * Math.PI) / 180,
                );
            }

            lastX = e.clientX;
            lastY = e.clientY;
        };

        const onWheel = (e: WheelEvent) => {
            preventDefault(e);

            if (!this.enabled) return;

            const zoomNorm = computeZoomNorm();
            desiredRadius += e.deltaY * this.zoomSpeed * 0.025 * zoomNorm;
            desiredRadius = Math.min(Math.max(desiredRadius, this.minZoom), this.maxZoom);
        };

        const onTouchStart = (e: TouchEvent) => {
            preventDefault(e);

            if (!this.enabled) return;

            if (e.touches.length === 1) {
                dragging = true;
                panning = false;
                lastX = e.touches[0].clientX;
                lastY = e.touches[0].clientY;
                lastDist = 0;
            } else if (e.touches.length === 2) {
                dragging = true;
                panning = true;
                lastX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
                lastY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
                const distX = e.touches[0].clientX - e.touches[1].clientX;
                const distY = e.touches[0].clientY - e.touches[1].clientY;
                lastDist = Math.sqrt(distX * distX + distY * distY);
            }
        };

        const onTouchEnd = (e: TouchEvent) => {
            preventDefault(e);

            dragging = false;
            panning = false;
        };

        const onTouchMove = (e: TouchEvent) => {
            preventDefault(e);

            if (!this.enabled || !dragging || !camera) return;

            if (panning) {
                const zoomNorm = computeZoomNorm();

                const distX = e.touches[0].clientX - e.touches[1].clientX;
                const distY = e.touches[0].clientY - e.touches[1].clientY;
                const dist = Math.sqrt(distX * distX + distY * distY);
                const delta = lastDist - dist;
                desiredRadius += delta * this.zoomSpeed * 0.1 * zoomNorm;
                desiredRadius = Math.min(Math.max(desiredRadius, this.minZoom), this.maxZoom);
                lastDist = dist;

                const touchX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
                const touchY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
                const dx = touchX - lastX;
                const dy = touchY - lastY;
                const R = SPLAT.Matrix3.RotationFromQuaternion(camera.rotation).buffer;
                const right = new SPLAT.Vector3(R[0], R[3], R[6]);
                const up = new SPLAT.Vector3(R[1], R[4], R[7]);
                desiredTarget = desiredTarget.add(right.multiply(-dx * this.panSpeed * 0.025 * zoomNorm));
                desiredTarget = desiredTarget.add(up.multiply(-dy * this.panSpeed * 0.025 * zoomNorm));
                lastX = touchX;
                lastY = touchY;
            } else {
                const dx = e.touches[0].clientX - lastX;
                const dy = e.touches[0].clientY - lastY;

                desiredAlpha -= dx * this.orbitSpeed * 0.003;
                desiredBeta += dy * this.orbitSpeed * 0.003;
                desiredBeta = Math.min(
                    Math.max(desiredBeta, (this.minAngle * Math.PI) / 180),
                    (this.maxAngle * Math.PI) / 180,
                );

                lastX = e.touches[0].clientX;
                lastY = e.touches[0].clientY;
            }
        };

        const lerp = (a: number, b: number, t: number) => {
            return (1 - t) * a + t * b;
        };

        this.update = () => {
            isUpdatingCamera = true;

            alpha = lerp(alpha, desiredAlpha, this.dampening);
            beta = lerp(beta, desiredBeta, this.dampening);
            radius = lerp(radius, desiredRadius, this.dampening);
            target = target.lerp(desiredTarget, this.dampening);

            const x = target.x + radius * Math.sin(alpha) * Math.cos(beta);
            const y = target.y - radius * Math.sin(beta);
            const z = target.z - radius * Math.cos(alpha) * Math.cos(beta);
            camera.position = new SPLAT.Vector3(x, y, z);

            const direction = target.subtract(camera.position).normalize();
            const rx = Math.asin(-direction.y);
            const ry = Math.atan2(direction.x, direction.z);
            camera.rotation = SPLAT.Quaternion.FromEuler(new SPLAT.Vector3(rx, ry, 0));

            isUpdatingCamera = false;
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
            canvas.removeEventListener("mousemove", onMouseMove);
            canvas.removeEventListener("wheel", onWheel);

            canvas.removeEventListener("touchstart", onTouchStart);
            canvas.removeEventListener("touchend", onTouchEnd);
            canvas.removeEventListener("touchmove", onTouchMove);
        };

        canvas.addEventListener("dragenter", preventDefault);
        canvas.addEventListener("dragover", preventDefault);
        canvas.addEventListener("dragleave", preventDefault);
        canvas.addEventListener("contextmenu", preventDefault);

        canvas.addEventListener("mousedown", onMouseDown);
        canvas.addEventListener("mouseup", onMouseUp);
        canvas.addEventListener("mousemove", onMouseMove);
        canvas.addEventListener("wheel", onWheel);

        canvas.addEventListener("touchstart", onTouchStart);
        canvas.addEventListener("touchend", onTouchEnd);
        canvas.addEventListener("touchmove", onTouchMove);

        this.update();
    }
}

export { OrbitControls };
