export declare class Modal {
    private readonly element;
    private tabDirection;
    constructor(element: HTMLElement);
    activate(): void;
    deactivate(): void;
    private isActive;
    private checkFocus;
    private handleFocusIn;
    private handleKeyDown;
    private handleKeyUp;
}
