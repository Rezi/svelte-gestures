import { type Coord } from './shared';
export type Options = {
    threshold?: number;
    nbOfSamplePoints?: number;
};
export type Pattern = {
    name: string;
    points: Coord[];
    allowRotation?: boolean;
    bothDirections?: boolean;
};
export type PatternWithCenter = Pattern & {
    center: Coord;
};
export type Result = {
    score: number;
    pattern: string | null;
};
export declare const DEFAULT_TRESHOLD = 0.9;
export declare const DEFAULT_NB_OF_SAMPLE_POINTS = 64;
export declare function shapeDetector(inputPatterns: Pattern[], options?: Options): {
    detect: (points: Coord[], patternName?: string) => Result;
};
//# sourceMappingURL=detector.d.ts.map