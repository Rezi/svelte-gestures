import { describe, expect, test, beforeEach, vi } from 'vitest';
import {
  pinchComposition,
  usePinch,
  type PinchParameters,
} from '../gestures/pinch/pinch.svelte';

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

describe('pinch.svelte.ts', () => {
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

  describe('pinchComposition', () => {
    test('should return correct gesture functions with default parameters', () => {
      const result = pinchComposition(mockNode);

      expect(result.onUp).toBe(null);
      expect(typeof result.onDown).toBe('function');
      expect(typeof result.onMove).toBe('function');
      expect(result.plugins).toBeUndefined();
    });

    test('should handle custom parameters', () => {
      const customParams: Partial<PinchParameters> = {
        composed: true,
        touchAction: 'pan-x',
      };

      const result = pinchComposition(mockNode, customParams);

      expect(result.onUp).toBe(null);
      expect(typeof result.onDown).toBe('function');
      expect(typeof result.onMove).toBe('function');
    });

    test('should initialize on down with two pointers', () => {
      const { onDown } = pinchComposition(mockNode);

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

      // Should not throw and should initialize the pinch gesture
      if (onDown) {
        expect(() => onDown(activeEvents, event1)).not.toThrow();
      }
    });

    test('should calculate center point correctly', () => {
      const { onDown, onMove } = pinchComposition(mockNode);

      const event1 = createMockPointerEvent({
        clientX: 40,
        clientY: 50,
        pointerId: 1,
        target: mockNode,
        pointerType: 'touch',
      });

      const event2 = createMockPointerEvent({
        clientX: 60,
        clientY: 70,
        pointerId: 2,
        target: mockNode,
        pointerType: 'touch',
      });

      const activeEvents = [event1, event2];

      // Initialize the pinch gesture
      if (onDown) {
        onDown(activeEvents, event1);
      }

      // Move the pointers farther apart to simulate zoom in
      const moveEvent1 = createMockPointerEvent({
        clientX: 30,
        clientY: 30,
        pointerId: 1,
        target: mockNode,
        pointerType: 'touch',
      });

      const moveEvent2 = createMockPointerEvent({
        clientX: 30,
        clientY: 30,
        pointerId: 2,
        target: mockNode,
        pointerType: 'touch',
      });

      // Move the pointers farther apart to simulate zoom in
      const moveEvent3 = createMockPointerEvent({
        clientX: 20,
        clientY: 50,
        pointerId: 1,
        target: mockNode,
        pointerType: 'touch',
      });

      const moveEvent4 = createMockPointerEvent({
        clientX: 80,
        clientY: 70,
        pointerId: 2,
        target: mockNode,
        pointerType: 'touch',
      });

      if (onMove) {
        onMove([moveEvent1, moveEvent2], moveEvent1);
        const result = onMove([moveEvent3, moveEvent4], moveEvent3);
        expect(result).toBe(false);
      }

      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'pinch',
          detail: expect.objectContaining({
            scale: expect.any(Number),
            center: expect.objectContaining({
              x: expect.any(Number),
              y: expect.any(Number),
            }),
            pointerType: 'touch',
          }),
        })
      );

      const lastCall =
        mockDispatchEvent.mock.calls[mockDispatchEvent.mock.calls.length - 1];
      const center = lastCall[0].detail.center;

      expect(center).toStrictEqual({
        x: 40, // min(80, 20) + (abs(80 - 20) / 2) - 10 (left offset)
        y: 40, // min(70, 50) + (abs(70 - 50) / 2) - 20 (top offset)
      });
    });
  });

  test('should dispatch pinch event on move with two pointers', () => {
    const { onDown, onMove } = pinchComposition(mockNode);

    const event1 = createMockPointerEvent({
      clientX: 40,
      clientY: 50,
      pointerId: 1,
      target: mockNode,
      pointerType: 'touch',
    });

    const event2 = createMockPointerEvent({
      clientX: 60,
      clientY: 70,
      pointerId: 2,
      target: mockNode,
      pointerType: 'touch',
    });

    const activeEvents = [event1, event2];

    // Initialize the pinch gesture
    if (onDown) {
      onDown(activeEvents, event1);
    }

    // Move the pointers farther apart to simulate zoom in
    const moveEvent1 = createMockPointerEvent({
      clientX: 30,
      clientY: 50,
      pointerId: 1,
      target: mockNode,
      pointerType: 'touch',
    });

    const moveEvent2 = createMockPointerEvent({
      clientX: 70,
      clientY: 70,
      pointerId: 2,
      target: mockNode,
      pointerType: 'touch',
    });

    // Move the pointers farther apart to simulate zoom in
    const moveEvent3 = createMockPointerEvent({
      clientX: 20,
      clientY: 50,
      pointerId: 1,
      target: mockNode,
      pointerType: 'touch',
    });

    const moveEvent4 = createMockPointerEvent({
      clientX: 80,
      clientY: 70,
      pointerId: 2,
      target: mockNode,
      pointerType: 'touch',
    });

    if (onMove) {
      onMove([moveEvent1, moveEvent2], moveEvent1);
      const result = onMove([moveEvent3, moveEvent4], moveEvent3);
      expect(result).toBe(false);
    }

    expect(mockDispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'pinch',
        detail: expect.objectContaining({
          scale: expect.any(Number),
          center: expect.objectContaining({
            x: expect.any(Number),
            y: expect.any(Number),
          }),
          pointerType: 'touch',
        }),
      })
    );
  });

  test('should calculate correct scale for zoom in', () => {
    const { onDown, onMove } = pinchComposition(mockNode);

    // Start with pointers close together
    const event1 = createMockPointerEvent({
      clientX: 50,
      clientY: 60,
      pointerId: 1,
    });

    const event2 = createMockPointerEvent({
      clientX: 60,
      clientY: 70,
      pointerId: 2,
    });

    const activeEvents = [event1, event2];

    // Initialize
    if (onDown) {
      onDown(activeEvents, event1);
    }

    // Move pointers farther apart (zoom in)
    const moveEvent1 = createMockPointerEvent({
      clientX: 50,
      clientY: 60,
      pointerId: 1,
    });

    const moveEvent2 = createMockPointerEvent({
      clientX: 60,
      clientY: 70,
      pointerId: 2,
    });

    const moveEvent3 = createMockPointerEvent({
      clientX: 40,
      clientY: 50,
      pointerId: 1,
    });

    const moveEvent4 = createMockPointerEvent({
      clientX: 80,
      clientY: 90,
      pointerId: 2,
    });

    if (onMove) {
      onMove([moveEvent1, moveEvent2], moveEvent1);
      onMove([moveEvent3, moveEvent4], moveEvent3);
    }

    expect(mockDispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'pinch',
        detail: expect.objectContaining({
          scale: expect.any(Number),
        }),
      })
    );

    // Extract the scale from the dispatched event
    const lastCall =
      mockDispatchEvent.mock.calls[mockDispatchEvent.mock.calls.length - 1];
    const scale = lastCall[0].detail.scale;

    // Scale should be greater than 1 for zoom in
    expect(scale).toBeGreaterThan(1);
  });

  test('should calculate correct scale for zoom out', () => {
    const { onDown, onMove } = pinchComposition(mockNode);

    // Start with pointers far apart
    const event1 = createMockPointerEvent({
      clientX: 30,
      clientY: 40,
      pointerId: 1,
    });

    const event2 = createMockPointerEvent({
      clientX: 90,
      clientY: 100,
      pointerId: 2,
    });

    const activeEvents = [event1, event2];

    // Initialize
    if (onDown) {
      onDown(activeEvents, event1);
    }

    // Move pointers closer together (zoom out)
    const moveEvent1 = createMockPointerEvent({
      clientX: 50,
      clientY: 60,
      pointerId: 1,
    });

    const moveEvent2 = createMockPointerEvent({
      clientX: 70,
      clientY: 80,
      pointerId: 2,
    });

    if (onMove) {
      onMove(activeEvents, event1);
      onMove([moveEvent1, moveEvent2], moveEvent1);
    }

    expect(mockDispatchEvent).toHaveBeenCalled();

    // Extract the scale from the dispatched event
    const lastCall =
      mockDispatchEvent.mock.calls[mockDispatchEvent.mock.calls.length - 1];
    const scale = lastCall[0].detail.scale;

    // Scale should be less than 1 for zoom out
    expect(scale).toBeLessThan(1);
  });

  test('should not dispatch pinch event with less than two pointers', () => {
    const { onDown, onMove } = pinchComposition(mockNode);

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

  describe('usePinch', () => {
    test('should return object with pinch handler and attachment key', () => {
      const handler = vi.fn();
      const result = usePinch(handler) as any;

      expect(result.onpinch).toBe(handler);
      expect(Object.keys(result)).toContain('onpinch');
      // Should have attachment key
      expect(Object.keys(result).length).toBe(1);
      expect(Object.getOwnPropertySymbols(result).length).toBe(1);
    });

    test('should include base handlers if provided', () => {
      const handler = vi.fn();
      const baseHandlers = {
        onpinchdown: vi.fn(),
        onpinchup: vi.fn(),
        onpinchmove: vi.fn(),
      };

      const result = usePinch(handler, undefined, baseHandlers) as any;

      expect(result.onpinch).toBe(handler);
      expect(result.onpinchdown).toBe(baseHandlers.onpinchdown);
      expect(result.onpinchup).toBe(baseHandlers.onpinchup);
      expect(result.onpinchmove).toBe(baseHandlers.onpinchmove);
    });
  });
});
