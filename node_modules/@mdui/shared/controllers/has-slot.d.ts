import type { ReactiveController, ReactiveControllerHost } from 'lit';
type SlotName = '[default]' | string;
/**
 * 检查指定的 slot 是否存在
 */
export declare class HasSlotController implements ReactiveController {
    private host;
    private slotNames;
    constructor(host: ReactiveControllerHost & Element, ...slotNames: SlotName[]);
    hostConnected(): void;
    hostDisconnected(): void;
    test(slotName: SlotName): boolean;
    private hasDefaultSlot;
    private hasNamedSlot;
    private onSlotChange;
}
export {};
