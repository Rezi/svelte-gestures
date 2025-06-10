import { describe, expect, test, beforeEach, vi } from 'vitest';
import {
  shapeGestureComposition,
  useShapeGesture,
  type ShapeGestureParameters,
} from '../gestures/shape-gesture/shapeGesture.svelte';
import { type Pattern } from '../gestures/shape-gesture/detector';

// Mock DOM methods
const mockGetBoundingClientRect = vi.fn();
const mockDispatchEvent = vi.fn();

// Helper function to create mock PointerEvent
function createMockPointerEvent(
  props: Partial<PointerEvent> = {}
): PointerEvent {
  return {
    clientX: 0,
    clientY: 0,
    target: null,
    pointerType: 'touch',
    pointerId: 1,
    ...props,
  } as unknown as PointerEvent;
}

// Sample pattern for testing (simple circle-like shape)
const circlePattern: Pattern = {
  name: 'circle',
  points: [
    { x: 100, y: 50 },
    { x: 90, y: 70 },
    { x: 70, y: 90 },
    { x: 50, y: 100 },
    { x: 30, y: 90 },
    { x: 10, y: 70 },
    { x: 0, y: 50 },
    { x: 10, y: 30 },
    { x: 30, y: 10 },
    { x: 50, y: 0 },
    { x: 70, y: 10 },
    { x: 90, y: 30 },
  ],
  allowRotation: true,
  bothDirections: true,
};

const trianglePattern: Pattern = {
  name: 'triangle',
  allowRotation: true,
  points: [
    { x: 0, y: 0 },
    { x: 50, y: 100 },
    { x: 100, y: 0 },
    { x: 0, y: 0 },
  ],
};

describe('shapeGesture.svelte.ts', () => {
  let mockNode: HTMLElement;

  beforeEach(() => {
    // Reset mocks before each test
    mockGetBoundingClientRect.mockReset();
    mockDispatchEvent.mockReset();

    // Create mock HTML element
    mockNode = {
      getBoundingClientRect: mockGetBoundingClientRect,
      dispatchEvent: mockDispatchEvent,
      style: { touchAction: '' },
    } as unknown as HTMLElement;

    mockGetBoundingClientRect.mockReturnValue({
      left: 10,
      top: 20,
      right: 110,
      bottom: 120,
      width: 100,
      height: 100,
    });
  });

  describe('shapeGestureComposition', () => {
    test('should return correct gesture functions with default parameters', () => {
      const result = shapeGestureComposition(mockNode, {
        shapes: [circlePattern],
      });

      expect(typeof result.onUp).toBe('function');
      expect(typeof result.onDown).toBe('function');
      expect(typeof result.onMove).toBe('function');
      expect(result.plugins).toBeUndefined();
    });

    test('should handle custom parameters', () => {
      const customParams: Partial<ShapeGestureParameters> = {
        shapes: [circlePattern, trianglePattern],
        timeframe: 500,
        threshold: 0.8,
        nbOfSamplePoints: 32,
        composed: true,
        touchAction: 'pan-x',
      };

      const result = shapeGestureComposition(mockNode, customParams);

      expect(typeof result.onUp).toBe('function');
      expect(typeof result.onDown).toBe('function');
      expect(typeof result.onMove).toBe('function');
    });

    test('should start tracking on down', () => {
      const { onDown } = shapeGestureComposition(mockNode, {
        shapes: [circlePattern],
      });

      const event1 = createMockPointerEvent({
        clientX: 50,
        clientY: 60,
        pointerId: 1,
        target: mockNode,
        pointerType: 'touch',
      });

      const activeEvents = [event1];

      // Should not throw and should start tracking
      if (onDown) {
        expect(() => onDown(activeEvents, event1)).not.toThrow();
      }
    });

    test('should track points on move', () => {
      const { onDown, onMove } = shapeGestureComposition(mockNode, {
        shapes: [circlePattern],
      });

      const downEvent = createMockPointerEvent({
        clientX: 50,
        clientY: 60,
        pointerId: 1,
        target: mockNode,
        pointerType: 'touch',
      });

      const activeEvents = [downEvent];

      // Start tracking
      if (onDown) {
        onDown(activeEvents, downEvent);
      }

      // Move to track points
      const moveEvent = createMockPointerEvent({
        clientX: 60,
        clientY: 70,
        pointerId: 1,
        target: mockNode,
        pointerType: 'touch',
      });

      if (onMove) {
        const result = onMove([moveEvent], moveEvent);
        expect(result).toBe(false);
      }

      // Should not dispatch event yet (still tracking)
      expect(mockDispatchEvent).not.toHaveBeenCalled();
    });

    test('should dispatch shape gesture event on up with single pointer', async () => {
      vi.useFakeTimers();

      const { onDown, onMove, onUp } = shapeGestureComposition(mockNode, {
        shapes: [trianglePattern],
        threshold: 0.5,
      });

      const startTime = Date.now();
      vi.spyOn(Date, 'now').mockReturnValue(startTime);

      const downEvent = createMockPointerEvent({
        clientX: 30,
        clientY: 60,
        pointerId: 1,
        target: mockNode,
        pointerType: 'touch',
      });

      // Start tracking
      if (onDown) {
        onDown([downEvent], downEvent);
      }

      // Draw a simple triangle
      const movePoints = [
        { x: 0, y: 0 },
        { x: 60, y: 0 },
        { x: 30, y: 50 },
        { x: 0, y: 0 },
      ];

      for (const point of movePoints) {
        const moveEvent = createMockPointerEvent({
          clientX: point.x,
          clientY: point.y,
          pointerId: 1,
          target: mockNode,
          pointerType: 'touch',
        });

        if (onMove) {
          onMove([moveEvent], moveEvent);
        }
      }

      // Move time forward but within timeframe
      vi.advanceTimersByTime(startTime + 200);

      const upEvent = createMockPointerEvent({
        clientX: 80,
        clientY: 60,
        pointerId: 1,
        target: mockNode,
        pointerType: 'touch',
      });

      if (onUp) {
        onUp([], upEvent);
      }

      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'shapeGesture',
          detail: expect.objectContaining({
            score: expect.any(Number),
            pattern: expect.any(String),
            target: mockNode,
            pointerType: 'touch',
          }),
        })
      );

      vi.useRealTimers();
    });

    test('should not dispatch event if no single pointer interaction', () => {
      const { onDown, onUp } = shapeGestureComposition(mockNode, {
        shapes: [circlePattern],
      });

      const event1 = createMockPointerEvent({
        clientX: 50,
        clientY: 60,
        pointerId: 1,
        target: mockNode,
        pointerType: 'touch',
      });

      const event2 = createMockPointerEvent({
        clientX: 70,
        clientY: 80,
        pointerId: 2,
        target: mockNode,
        pointerType: 'touch',
      });

      const activeEvents = [event1, event2]; // Multiple pointers

      if (onDown) {
        onDown(activeEvents, event1);
      }

      if (onUp) {
        onUp([event1], event2); // Still multiple pointers
      }

      expect(mockDispatchEvent).not.toHaveBeenCalled();
    });

    test('should not dispatch event if timeframe exceeded', () => {
      vi.useFakeTimers();

      const timeframe = 300;
      const { onDown, onUp } = shapeGestureComposition(mockNode, {
        shapes: [circlePattern],
        timeframe,
      });

      const startTime = Date.now();
      vi.spyOn(Date, 'now').mockReturnValue(startTime);

      const downEvent = createMockPointerEvent({
        clientX: 50,
        clientY: 60,
        pointerId: 1,
        target: mockNode,
        pointerType: 'touch',
      });

      if (onDown) {
        onDown([downEvent], downEvent);
      }

      // Move time forward beyond timeframe
      vi.spyOn(Date, 'now').mockReturnValue(startTime + timeframe + 100);

      const upEvent = createMockPointerEvent({
        clientX: 80,
        clientY: 60,
        pointerId: 1,
        target: mockNode,
        pointerType: 'touch',
      });

      if (onUp) {
        onUp([], upEvent);
      }

      expect(mockDispatchEvent).not.toHaveBeenCalled();

      vi.useRealTimers();
    });

    test('should handle custom threshold and sample points', () => {
      const customThreshold = 0.8;
      const customSamplePoints = 32;

      const result = shapeGestureComposition(mockNode, {
        shapes: [circlePattern],
        threshold: customThreshold,
        nbOfSamplePoints: customSamplePoints,
      });

      expect(typeof result.onUp).toBe('function');
      expect(typeof result.onDown).toBe('function');
      expect(typeof result.onMove).toBe('function');
    });

    test('should reset tracking state between gestures', () => {
      const { onDown, onUp } = shapeGestureComposition(mockNode, {
        shapes: [trianglePattern],
      });

      // First gesture
      const downEvent1 = createMockPointerEvent({
        clientX: 30,
        clientY: 60,
        pointerId: 1,
      });

      if (onDown) {
        onDown([downEvent1], downEvent1);
      }

      const upEvent1 = createMockPointerEvent({
        clientX: 80,
        clientY: 60,
        pointerId: 1,
      });

      if (onUp) {
        onUp([], upEvent1);
      }

      // Second gesture should start fresh
      const downEvent2 = createMockPointerEvent({
        clientX: 40,
        clientY: 70,
        pointerId: 2,
      });

      if (onDown) {
        expect(() => onDown([downEvent2], downEvent2)).not.toThrow();
      }
    });
  });

  describe('useShapeGesture', () => {
    test('should return object with shape gesture handler and attachment key', () => {
      const handler = vi.fn();
      const result = useShapeGesture(handler, () => ({
        shapes: [circlePattern],
      })) as any;

      expect(result.onshapeGesture).toBe(handler);
      expect(Object.keys(result)).toContain('onshapeGesture');
      // Should have attachment key
      expect(Object.keys(result).length).toBe(1);
    });

    test('should include base handlers if provided', () => {
      const handler = vi.fn();
      const baseHandlers = {
        onshapeGesturedown: vi.fn(),
        onshapeGestureup: vi.fn(),
        onshapeGesturemove: vi.fn(),
      };

      const result = useShapeGesture(
        handler,
        () => ({ shapes: [circlePattern] }),
        baseHandlers
      ) as any;

      expect(result.onshapeGesture).toBe(handler);
      expect(result.onshapeGesturedown).toBe(baseHandlers.onshapeGesturedown);
      expect(result.onshapeGestureup).toBe(baseHandlers.onshapeGestureup);
      expect(result.onshapeGesturemove).toBe(baseHandlers.onshapeGesturemove);
    });
  });
});
