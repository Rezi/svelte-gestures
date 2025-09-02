import type { GesturePlugin } from '../shared';
export type TouchPointsPluginFn = (options: {
    color?: string;
    zIndex?: number;
    size?: number;
}) => GesturePlugin;
export declare const touchPointsPlugin: TouchPointsPluginFn;
//# sourceMappingURL=plugin-touch-points.d.ts.map