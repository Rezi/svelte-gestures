import { type Action, type BaseParams, type GestureCustomEvent, type SubGestureFunctions } from '../../shared';
export type PanParameters = {
    delay: number;
} & BaseParams;
export type PanPointerEventDetail = {
    x: number;
    y: number;
    target: EventTarget | null;
    pointerType: string;
};
export type PanCustomEvent = CustomEvent<PanPointerEventDetail>;
export declare const pan: Action<HTMLElement, () => Partial<PanParameters>, {
    onpan: (e: PanCustomEvent) => void;
    onpandown: (e: GestureCustomEvent) => void;
    onpanup: (e: GestureCustomEvent) => void;
    onpanmove: (e: GestureCustomEvent) => void;
}>;
export declare const panComposition: (node: HTMLElement, inputParameters?: Partial<PanParameters>) => SubGestureFunctions;
//# sourceMappingURL=pan.svelte.d.ts.map