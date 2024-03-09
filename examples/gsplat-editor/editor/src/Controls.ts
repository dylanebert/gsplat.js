import { InputHandler } from "./InputHandler";

class Controls {
    private _inputHandlers: InputHandler[];

    constructor(inputHandlers: InputHandler[], canvas: HTMLCanvasElement) {
        this._inputHandlers = inputHandlers;

        window.addEventListener("keydown", this.handleInput.bind(this));
        canvas.addEventListener("mousedown", this.handleInput.bind(this));
        canvas.addEventListener("mousemove", this.handleInput.bind(this));
        canvas.addEventListener("mouseup", this.handleInput.bind(this));
        canvas.addEventListener("click", this.handleInput.bind(this));
        canvas.addEventListener("contextmenu", this.handleInput.bind(this));
    }

    handleInput(event: Event) {
        for (const handler of this._inputHandlers) {
            handler.handleInput(event);
        }
    }
}

export { Controls };
