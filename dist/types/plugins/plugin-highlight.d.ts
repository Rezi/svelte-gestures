import type { GesturePlugin } from '../shared';
export type HighlightPluginFn = (options: {
    color?: string;
    fadeTime?: number;
    zIndex?: number;
    lineWidth?: number;
}) => GesturePlugin;
export declare const highlightPlugin: HighlightPluginFn;
//# sourceMappingURL=plugin-highlight.d.ts.map