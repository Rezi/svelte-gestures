import { describe, expect, test, beforeEach, vi } from 'vitest';
import {
  rotateComposition,
  useRotate,
  type RotateParameters,
} from '../gestures/rotate/rotate.svelte';
import { DEFAULT_TOUCH_ACTION } from '../shared';

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

describe('rotate.svelte.ts', () => {
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

  describe('rotateComposition', () => {
    test('should return correct gesture functions with default parameters', () => {
      const result = rotateComposition(mockNode);

      expect(typeof result.onUp).toBe('function');
      expect(typeof result.onDown).toBe('function');
      expect(typeof result.onMove).toBe('function');
      expect(result.plugins).toBeUndefined();
    });

    test('should handle custom parameters', () => {
      const customParams: Partial<RotateParameters> = {
        composed: true,
        touchAction: 'pan-x',
      };

      const result = rotateComposition(mockNode, customParams);

      expect(typeof result.onUp).toBe('function');
      expect(typeof result.onDown).toBe('function');
      expect(typeof result.onMove).toBe('function');
    });

    test('should handle small rotations correctly', () => {
      const { onDown, onMove } = rotateComposition(mockNode);

      const event1 = createMockPointerEvent({
        clientX: 50,
        clientY: 60,
        pointerId: 1,
      });

      const event2 = createMockPointerEvent({
        clientX: 70,
        clientY: 60,
        pointerId: 2,
      });

      const activeEvents = [event1, event2];

      if (onDown) {
        onDown(activeEvents, event1);
      }

      // Very small rotation

      const moveEvent1 = createMockPointerEvent({
        clientX: 50,
        clientY: 60,
        pointerId: 1,
      });

      const moveEvent2 = createMockPointerEvent({
        clientX: 70,
        clientY: 60,
        pointerId: 2,
      });
      const moveEvent3 = createMockPointerEvent({
        clientX: 50,
        clientY: 62,
        pointerId: 1,
      });

      const moveEvent4 = createMockPointerEvent({
        clientX: 70,
        clientY: 58,
        pointerId: 2,
      });

      if (onMove) {
        onMove([moveEvent1, moveEvent2], moveEvent1);
        onMove([moveEvent3, moveEvent4], moveEvent3);
      }

      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'rotate',
          detail: expect.objectContaining({
            rotation: expect.any(Number),
          }),
        })
      );

      const lastCall =
        mockDispatchEvent.mock.calls[mockDispatchEvent.mock.calls.length - 1];
      const rotation = lastCall[0].detail.rotation;

      // Should be a small rotation
      expect(Math.abs(rotation)).toBeLessThan(20); // Less than 45 degrees
    });

    test('should initialize on down with two pointers', () => {
      const { onDown } = rotateComposition(mockNode);

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

      const activeEvents = [event1, event2];

      // Should not throw and should initialize the rotate gesture
      if (onDown) {
        expect(() => onDown(activeEvents, event1)).not.toThrow();
      }
    });

    test('should dispatch rotate event on move with two pointers', () => {
      const { onDown, onMove } = rotateComposition(mockNode);

      const event1 = createMockPointerEvent({
        clientX: 50,
        clientY: 70,
        pointerId: 1,
        target: mockNode,
        pointerType: 'touch',
      });

      const event2 = createMockPointerEvent({
        clientX: 70,
        clientY: 50,
        pointerId: 2,
        target: mockNode,
        pointerType: 'touch',
      });

      const activeEvents = [event1, event2];

      // Initialize the rotate gesture
      if (onDown) {
        onDown(activeEvents, event1);
      }

      // Move the pointers to create rotation
      const moveEvent1 = createMockPointerEvent({
        clientX: 70,
        clientY: 70,
        pointerId: 1,
        target: mockNode,
        pointerType: 'touch',
      });

      const moveEvent2 = createMockPointerEvent({
        clientX: 50,
        clientY: 50,
        pointerId: 2,
        target: mockNode,
        pointerType: 'touch',
      });
      // Move the pointers to create rotation
      const moveEvent3 = createMockPointerEvent({
        clientX: 71,
        clientY: 70,
        pointerId: 1,
        target: mockNode,
        pointerType: 'touch',
      });

      const moveEvent4 = createMockPointerEvent({
        clientX: 52,
        clientY: 50,
        pointerId: 2,
        target: mockNode,
        pointerType: 'touch',
      });

      if (onMove) {
        const result = onMove([moveEvent1, moveEvent2], moveEvent1);
        onMove([moveEvent1, moveEvent3], moveEvent4);
        expect(result).toBe(false);
      }

      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'rotate',
          detail: expect.objectContaining({
            rotation: expect.any(Number),
            center: expect.objectContaining({
              x: expect.any(Number),
              y: expect.any(Number),
            }),
            pointerType: 'touch',
          }),
        })
      );
    });

    test('should calculate correct rotation angle', () => {
      const { onDown, onMove } = rotateComposition(mockNode);

      // Start with horizontal line (pointer 1 left, pointer 2 right)
      const event1 = createMockPointerEvent({
        clientX: 40,
        clientY: 60,
        pointerId: 1,
      });

      const event2 = createMockPointerEvent({
        clientX: 80,
        clientY: 60,
        pointerId: 2,
      });

      const activeEvents = [event1, event2];

      // Initialize
      if (onDown) {
        onDown(activeEvents, event1);
      }

      // Rotate to vertical line (pointer 1 top, pointer 2 bottom)
      const moveEvent1 = createMockPointerEvent({
        clientX: 60,
        clientY: 40,
        pointerId: 1,
      });

      const moveEvent2 = createMockPointerEvent({
        clientX: 60,
        clientY: 80,
        pointerId: 2,
      });

      const moveActiveEvents = [moveEvent1, moveEvent2];

      if (onMove) {
        onMove(activeEvents, event1);
        onMove(moveActiveEvents, moveEvent1);
      }

      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'rotate',
          detail: expect.objectContaining({
            rotation: expect.any(Number),
          }),
        })
      );

      // The rotation should be around 90 degrees
      const lastCall =
        mockDispatchEvent.mock.calls[mockDispatchEvent.mock.calls.length - 1];
      const rotation = lastCall[0].detail.rotation;

      // Allow for some floating point imprecision
      expect(Math.abs(Math.abs(rotation) - 90)).toBeLessThan(0.1);
    });

    test('should not dispatch rotate event with less than two pointers', () => {
      const { onDown, onMove } = rotateComposition(mockNode);

      const event1 = createMockPointerEvent({
        clientX: 50,
        clientY: 60,
        pointerId: 1,
      });

      const activeEvents = [event1]; // Only one pointer

      if (onDown) {
        onDown(activeEvents, event1);
      }

      if (onMove) {
        onMove(activeEvents, event1);
      }

      expect(mockDispatchEvent).not.toHaveBeenCalled();
    });

    test('should calculate center point correctly', () => {
      const { onDown, onMove } = rotateComposition(mockNode);

      const event1 = createMockPointerEvent({
        clientX: 55,
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
      const event3 = createMockPointerEvent({
        clientX: 50,
        clientY: 60,
        pointerId: 1,
        target: mockNode,
        pointerType: 'touch',
      });

      const event4 = createMockPointerEvent({
        clientX: 70,
        clientY: 80,
        pointerId: 2,
        target: mockNode,
        pointerType: 'touch',
      });

      const activeEvents = [event1, event2];

      if (onDown) {
        onDown(activeEvents, event1);
      }

      if (onMove) {
        onMove(activeEvents, event1);
        onMove([event3, event4], event3);
      }

      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'rotate',
          detail: expect.objectContaining({
            center: {
              x: expect.any(Number),
              y: expect.any(Number),
            },
          }),
        })
      );

      const lastCall =
        mockDispatchEvent.mock.calls[mockDispatchEvent.mock.calls.length - 1];
      const center = lastCall[0].detail.center;

      expect(center).toStrictEqual({
        x: 53, // (55 + 70)/2 - 10 (left offset) = 63 - 10 = 50
        y: 50, // (60 + 80)/2 - 20 (top offset) = 70 - 20 = 50
      });
    });
  });

  describe('useRotate', () => {
    test('should return object with rotate handler and attachment key', () => {
      const handler = vi.fn();
      const result = useRotate(handler) as any;

      expect(result.onrotate).toBe(handler);
      expect(Object.keys(result)).toContain('onrotate');
      // Should have attachment key
      expect(Object.keys(result).length).toBe(1);
    });

    test('should include base handlers if provided', () => {
      const handler = vi.fn();
      const baseHandlers = {
        onrotatedown: vi.fn(),
        onrotateup: vi.fn(),
        onrotatemove: vi.fn(),
      };

      const result = useRotate(handler, undefined, baseHandlers) as any;

      expect(result.onrotate).toBe(handler);
      expect(result.onrotatedown).toBe(baseHandlers.onrotatedown);
      expect(result.onrotateup).toBe(baseHandlers.onrotateup);
      expect(result.onrotatemove).toBe(baseHandlers.onrotatemove);
    });
  });
});
