import * as SPLAT from "gsplat";
import { Engine } from "./Engine";
import { SelectionManager } from "./SelectionManager";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const progressDialog = document.getElementById("progress-dialog") as HTMLDialogElement;
const progressIndicator = document.getElementById("progress-indicator") as HTMLProgressElement;
const uploadButton = document.getElementById("upload-button") as HTMLButtonElement;
const downloadButton = document.getElementById("download-button") as HTMLButtonElement;
const controlsDisplayButton = document.getElementById("controls-display-button") as HTMLButtonElement;
const controlsDisplay = document.getElementById("controls-display") as HTMLDivElement;
const uploadModal = document.getElementById("upload-modal") as HTMLDialogElement;
const uploadModalClose = document.getElementById("upload-modal-close") as HTMLButtonElement;
const downloadModal = document.getElementById("download-modal") as HTMLDialogElement;
const downloadModalClose = document.getElementById("download-modal-close") as HTMLButtonElement;
const fileInput = document.getElementById("file-input") as HTMLInputElement;
const urlInput = document.getElementById("url-input") as HTMLInputElement;
const uploadSubmit = document.getElementById("upload-submit") as HTMLButtonElement;
const uploadError = document.getElementById("upload-error") as HTMLDivElement;
const downloadSubmit = document.getElementById("download-submit") as HTMLButtonElement;
const learnMoreButton = document.getElementById("about") as HTMLButtonElement;
const splatRadio = document.getElementById("splat") as HTMLInputElement;
const plyRadio = document.getElementById("ply") as HTMLInputElement;

const engine = new Engine(canvas);

let loading = false;
async function selectFile(file: File) {
    if (loading) return;
    SelectionManager.selectedSplat = null;
    loading = true;
    if (file.name.endsWith(".splat")) {
        uploadModal.style.display = "none";
        progressDialog.showModal();
        await SPLAT.Loader.LoadFromFileAsync(file, engine.scene, (progress: number) => {
            progressIndicator.value = progress * 100;
        });
        progressDialog.close();
    } else if (file.name.endsWith(".ply")) {
        const format = "";
        // const format = "polycam"; // Uncomment to load a Polycam PLY file
        uploadModal.style.display = "none";
        progressDialog.showModal();
        await SPLAT.PLYLoader.LoadFromFileAsync(
            file,
            engine.scene,
            (progress: number) => {
                progressIndicator.value = progress * 100;
            },
            format
        );
        progressDialog.close();
    } else {
        uploadError.style.display = "block";
        uploadError.innerText = `Invalid file type: ${file.name}`;
    }
    loading = false;
}

async function main() {
    const url = "https://huggingface.co/datasets/dylanebert/3dgs/resolve/main/bonsai/bonsai-7k-mini.splat";
    await SPLAT.Loader.LoadAsync(url, engine.scene, (progress) => (progressIndicator.value = progress * 100));
    progressDialog.close();
    engine.renderer.backgroundColor = new SPLAT.Color32(64, 64, 64, 255);

    const handleResize = () => {
        engine.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    };

    const frame = () => {
        engine.update();

        requestAnimationFrame(frame);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    requestAnimationFrame(frame);

    document.addEventListener("drop", (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.dataTransfer != null) {
            selectFile(e.dataTransfer.files[0]);
        }
    });

    uploadButton.addEventListener("click", () => {
        uploadModal.style.display = "block";
    });

    uploadModalClose.addEventListener("click", () => {
        uploadModal.style.display = "none";
    });

    downloadButton.addEventListener("click", () => {
        downloadModal.style.display = "block";
    });

    downloadModalClose.addEventListener("click", () => {
        downloadModal.style.display = "none";
    });

    controlsDisplayButton.addEventListener("click", () => {
        controlsDisplayButton.classList.toggle("active");
        controlsDisplay.classList.toggle("active");
    });

    fileInput.addEventListener("change", () => {
        if (fileInput.files != null) {
            selectFile(fileInput.files[0]);
        }
    });

    uploadSubmit.addEventListener("click", async () => {
        let url = urlInput.value;
        if (url === "") {
            url = urlInput.placeholder;
        }
        if (url.endsWith(".splat")) {
            uploadModal.style.display = "none";
            progressDialog.showModal();
            await SPLAT.Loader.LoadAsync(url, engine.scene, (progress) => (progressIndicator.value = progress * 100));
            progressDialog.close();
        } else if (url.endsWith(".ply")) {
            uploadModal.style.display = "none";
            progressDialog.showModal();
            await SPLAT.PLYLoader.LoadAsync(
                url,
                engine.scene,
                (progress) => (progressIndicator.value = progress * 100)
            );
            progressDialog.close();
        } else {
            uploadError.style.display = "block";
            uploadError.innerText = `Invalid file type: ${url}`;
            return;
        }
    });

    downloadSubmit.addEventListener("click", () => {
        let format;
        if (splatRadio.checked) {
            format = "splat";
        } else if (plyRadio.checked) {
            format = "ply";
        } else {
            throw new Error("Unknown format");
        }
        const filename = "model." + format;

        if (SelectionManager.selectedSplat !== null) {
            SelectionManager.selectedSplat.saveToFile(filename, format);
        } else {
            engine.scene.saveToFile(filename, format);
        }
    });

    learnMoreButton.addEventListener("click", () => {
        window.open("https://huggingface.co/spaces/dylanebert/gsplat-editor/discussions/1", "_blank");
    });

    window.addEventListener("click", () => {
        window.focus();
    });
}

main();
