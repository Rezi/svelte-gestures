import { type SvelteAction, type SubGestureFunctions, type BaseParams } from './shared';
export type GestureCallback = (register: RegisterGestureType) => (activeEvents: PointerEvent[], event: PointerEvent) => boolean;
export type RegisterGestureType = (gestureFn: (node: HTMLElement, params: BaseParams) => SubGestureFunctions, parameters: BaseParams) => void;
export declare function gesture(node: HTMLElement, gestureCallback: GestureCallback): SvelteAction;
//# sourceMappingURL=gesture.d.ts.map