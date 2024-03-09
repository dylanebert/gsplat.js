export interface Action {
    execute(): void;
    undo(): void;
}
