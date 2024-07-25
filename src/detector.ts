import { type Coord } from './shared';

export type Options = { threshold?: number; nbOfSamplePoints?: number };

export type Pattern = {
  name: string;
  points: Coord[];
  allowRotation?: boolean;
  bothDirections?: boolean;
};
export type PatternWithCenter = Pattern & {
  center: Coord;
};

export type Result = { score: number; pattern: string | null };

export const DEFAULT_TRESHOLD = 0.9;
export const DEFAULT_NB_OF_SAMPLE_POINTS = 64;

const PHI = (Math.sqrt(5.0) - 1) / 2;
const ANGLE_RANGE_RAD = deg2Rad(45.0);
const ANGLE_PRECISION_RAD = deg2Rad(2.0);

function deg2Rad(d: number) {
  return (d * Math.PI) / 180;
}

function getDistance(a: Coord, b: Coord) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function distanceAtBestAngle(pattern: Pattern, points: Coord[], center: Coord) {
  let fromAngleRad = -ANGLE_RANGE_RAD;
  let toAngleRad = ANGLE_RANGE_RAD;
  let angleOne = PHI * fromAngleRad + (1.0 - PHI) * toAngleRad;
  let distanceOne = distanceAtAngle(pattern, angleOne, points, center);
  let angleTwo = (1.0 - PHI) * fromAngleRad + PHI * toAngleRad;
  let distanceTwo = distanceAtAngle(pattern, angleTwo, points, center);

  while (Math.abs(toAngleRad - fromAngleRad) > ANGLE_PRECISION_RAD) {
    if (distanceOne < distanceTwo) {
      toAngleRad = angleTwo;
      angleTwo = angleOne;
      distanceTwo = distanceOne;
      angleOne = PHI * fromAngleRad + (1.0 - PHI) * toAngleRad;
      distanceOne = distanceAtAngle(pattern, angleOne, points, center);
    } else {
      fromAngleRad = angleOne;
      angleOne = angleTwo;
      distanceOne = distanceTwo;
      angleTwo = (1.0 - PHI) * fromAngleRad + PHI * toAngleRad;
      distanceTwo = distanceAtAngle(pattern, angleTwo, points, center);
    }
  }

  return Math.min(distanceOne, distanceTwo);
}

function distanceAtAngle(
  pattern: Pattern,
  angle: number,
  points: Coord[],
  center: Coord
) {
  const strokePoints = rotateBy(angle, points, center);

  const d = strokePoints.reduce((accu, sPoint, i) => {
    return (accu += getDistance(sPoint, pattern.points[i]));
  }, 0);

  return d / strokePoints.length;
}

function rotateBy(angle: number, points: Coord[], center: Coord) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  return points.map((point) => {
    return {
      x: (point.x - center.x) * cos - (point.y - center.y) * sin + center.x,
      y: (point.x - center.x) * sin + (point.y - center.y) * cos + center.y,
    };
  });
}

export function shapeDetector(inputPatterns: Pattern[], options: Options = {}) {
  const threshold = options.threshold || 0;
  const NUMBER_OF_SAMPLE_POINTS =
    options.nbOfSamplePoints || DEFAULT_NB_OF_SAMPLE_POINTS;
  const SQUARE_SIZE = 250;
  const HALF_SQUARE_DIAGONAL =
    Math.sqrt(SQUARE_SIZE ** 2 + SQUARE_SIZE ** 2) / 2;

  const patterns: Pattern[] = inputPatterns.flatMap((pattern) =>
    learn(
      pattern.name,
      pattern.points,
      pattern.allowRotation ?? false,
      pattern.bothDirections ?? true
    )
  );

  function getStroke(
    points: Coord[],
    name: string,
    allowRotation: boolean
  ): PatternWithCenter {
    points = resample();
    const center = getCenterPoint();
    if (allowRotation) {
      points = rotateBy(-indicativeAngle(center), points, center);
    }
    points = scaleToSquare();
    points = translateToOrigin(getCenterPoint());

    return { name, points, center: { x: 0, y: 0 }, allowRotation };

    function resample() {
      let localDistance, q;
      let distance = 0;
      const interval = strokeLength() / (NUMBER_OF_SAMPLE_POINTS - 1);
      const newPoints = [points[0]];

      for (let i = 1; i < points.length; i++) {
        localDistance = getDistance(points[i - 1], points[i]);

        if (distance + localDistance >= interval) {
          q = {
            x:
              points[i - 1].x +
              ((interval - distance) / localDistance) *
                (points[i].x - points[i - 1].x),
            y:
              points[i - 1].y +
              ((interval - distance) / localDistance) *
                (points[i].y - points[i - 1].y),
          };

          newPoints.push(q);
          points.splice(i, 0, q);
          distance = 0;
        } else {
          distance += localDistance;
        }
      }

      if (newPoints.length === NUMBER_OF_SAMPLE_POINTS - 1) {
        newPoints.push(points[points.length - 1]);
      }

      return newPoints;
    }

    function scaleToSquare() {
      const box = {
        minX: +Infinity,
        maxX: -Infinity,
        minY: +Infinity,
        maxY: -Infinity,
        width: 0,
        height: 0,
      };

      points.forEach((point) => {
        box.minX = Math.min(box.minX, point.x);
        box.minY = Math.min(box.minY, point.y);
        box.maxX = Math.max(box.maxX, point.x);
        box.maxY = Math.max(box.maxY, point.y);
      });

      box.width = box.maxX - box.minX;
      box.height = box.maxY - box.minY;

      return points.map((point) => {
        return {
          x: point.x * (SQUARE_SIZE / box.width),
          y: point.y * (SQUARE_SIZE / box.height),
        };
      });
    }

    function translateToOrigin(center: Coord) {
      return points.map((point) => ({
        x: point.x - center.x,
        y: point.y - center.y,
      }));
    }

    function getCenterPoint() {
      const centre = points.reduce(
        (acc, point) => {
          acc.x += point.x;
          acc.y += point.y;

          return acc;
        },
        {
          x: 0,
          y: 0,
        }
      );

      centre.x /= points.length;
      centre.y /= points.length;

      return centre;
    }

    function indicativeAngle(center: Coord) {
      return Math.atan2(center.y - points[0].y, center.x - points[0].x);
    }

    function strokeLength() {
      let d = 0;

      for (let i = 1; i < points.length; i++) {
        d += getDistance(points[i - 1], points[i]);
      }

      return d;
    }
  }

  function detect(points: Coord[], patternName = ''): Result {
    const strokeRotated: PatternWithCenter = getStroke(
      points,
      patternName,
      true
    );
    const strokeUnrotated: PatternWithCenter = getStroke(
      points,
      patternName,
      false
    );

    let bestDistance = +Infinity;
    let bestPattern = null;
    let bestScore = 0;

    patterns.forEach((pattern) => {
      if (pattern.name.indexOf(patternName) > -1) {
        const distance = pattern.allowRotation
          ? distanceAtBestAngle(
              pattern,
              strokeRotated.points,
              strokeRotated.center
            )
          : distanceAtAngle(
              pattern,
              0,
              strokeUnrotated.points,
              strokeUnrotated.center
            );
        const score = 1.0 - distance / HALF_SQUARE_DIAGONAL;

        if (distance < bestDistance && score > threshold) {
          bestDistance = distance;
          bestPattern = pattern.name;
          bestScore = score;
        }
      }
    });

    return { pattern: bestPattern, score: bestScore };
  }

  function learn(
    name: string,
    points: Coord[],
    allowRotation: boolean,
    bothDirections: boolean
  ) {
    const response = [getStroke([...points], name, allowRotation)];
    if (bothDirections) {
      response.push(getStroke([...points.reverse()], name, allowRotation));
    }
    return response;
  }

  return { detect };
}
