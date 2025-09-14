import { describe, expect, test, beforeEach, vi } from 'vitest';
import {
  swipeComposition,
  useSwipe,
  type SwipeParameters,
  type Direction,
} from '../gestures/swipe/swipe.svelte';
import {
  DEFAULT_DELAY,
  DEFAULT_MIN_SWIPE_DISTANCE,
  DEFAULT_TOUCH_ACTION,
} from '../shared';

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

describe('swipe.svelte.ts', () => {
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

  describe('swipeComposition', () => {
    test('should return correct gesture functions with default parameters', () => {
      const result = swipeComposition(mockNode);

      expect(result.onMove).toBe(null);
      expect(typeof result.onDown).toBe('function');
      expect(typeof result.onUp).toBe('function');
      expect(result.plugins).toBeUndefined();
    });

    test('should handle custom parameters', () => {
      const customParams: Partial<SwipeParameters> = {
        timeframe: 500,
        minSwipeDistance: 100,
        composed: true,
        touchAction: 'pan-x',
      };

      const result = swipeComposition(mockNode, customParams);

      expect(result.onMove).toBe(null);
      expect(typeof result.onDown).toBe('function');
      expect(typeof result.onUp).toBe('function');
    });

    test('should record start position, time and target on down', () => {
      const { onDown } = swipeComposition(mockNode);
      const mockEvent = createMockPointerEvent({
        clientX: 50,
        clientY: 60,
        target: mockNode,
        pointerType: 'touch',
      });

      const activeEvents = [mockEvent];

      // Should not throw and should record the event details internally
      if (onDown) {
        expect(() => onDown(activeEvents, mockEvent)).not.toThrow();
      }
    });

    test('should dispatch swipe right event on successful horizontal swipe', () => {
      const { onDown, onUp } = swipeComposition(mockNode);

      const startTime = Date.now();
      vi.spyOn(Date, 'now').mockReturnValue(startTime);

      const downEvent = createMockPointerEvent({
        clientX: 50,
        clientY: 60,
        target: mockNode,
        pointerType: 'touch',
      });

      const activeEvents = [downEvent];
      if (onDown) {
        onDown(activeEvents, downEvent);
      }

      // Move time forward but within timeframe (DEFAULT_DELAY = 300ms)
      vi.spyOn(Date, 'now').mockReturnValue(startTime + 200);

      const upEvent = createMockPointerEvent({
        clientX: 50 + DEFAULT_MIN_SWIPE_DISTANCE + 10, // Right swipe beyond min distance
        clientY: 60,
        target: mockNode,
        pointerType: 'touch',
        type: 'pointerup',
      });

      if (onUp) {
        onUp([], upEvent);
      }

      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'swipe',
          detail: {
            direction: 'right',
            target: mockNode,
            pointerType: 'touch',
          },
        })
      );
    });

    test('should dispatch swipe left event on successful horizontal swipe', () => {
      const { onDown, onUp } = swipeComposition(mockNode);

      const startTime = Date.now();
      vi.spyOn(Date, 'now').mockReturnValue(startTime);

      const downEvent = createMockPointerEvent({
        clientX: 100,
        clientY: 60,
        target: mockNode,
        pointerType: 'touch',
      });

      const activeEvents = [downEvent];
      if (onDown) {
        onDown(activeEvents, downEvent);
      }

      // Move time forward but within timeframe
      vi.spyOn(Date, 'now').mockReturnValue(startTime + 200);

      const upEvent = createMockPointerEvent({
        clientX: 100 - DEFAULT_MIN_SWIPE_DISTANCE - 10, // Left swipe beyond min distance
        clientY: 60,
        target: mockNode,
        pointerType: 'touch',
        type: 'pointerup',
      });

      if (onUp) {
        onUp([], upEvent);
      }

      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'swipe',
          detail: {
            direction: 'left',
            target: mockNode,
            pointerType: 'touch',
          },
        })
      );
    });

    test('should dispatch swipe bottom event on successful vertical swipe', () => {
      const { onDown, onUp } = swipeComposition(mockNode);

      const startTime = Date.now();
      vi.spyOn(Date, 'now').mockReturnValue(startTime);

      const downEvent = createMockPointerEvent({
        clientX: 50,
        clientY: 60,
        target: mockNode,
        pointerType: 'touch',
      });

      const activeEvents = [downEvent];
      if (onDown) {
        onDown(activeEvents, downEvent);
      }

      // Move time forward but within timeframe
      vi.spyOn(Date, 'now').mockReturnValue(startTime + 200);

      const upEvent = createMockPointerEvent({
        clientX: 50,
        clientY: 60 + DEFAULT_MIN_SWIPE_DISTANCE + 10, // Down swipe beyond min distance
        target: mockNode,
        pointerType: 'touch',
        type: 'pointerup',
      });

      if (onUp) {
        onUp([], upEvent);
      }

      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'swipe',
          detail: {
            direction: 'bottom',
            target: mockNode,
            pointerType: 'touch',
          },
        })
      );
    });

    test('should dispatch swipe top event on successful vertical swipe', () => {
      const { onDown, onUp } = swipeComposition(mockNode);

      const startTime = Date.now();
      vi.spyOn(Date, 'now').mockReturnValue(startTime);

      const downEvent = createMockPointerEvent({
        clientX: 50,
        clientY: 100,
        target: mockNode,
        pointerType: 'touch',
      });

      const activeEvents = [downEvent];
      if (onDown) {
        onDown(activeEvents, downEvent);
      }

      // Move time forward but within timeframe
      vi.spyOn(Date, 'now').mockReturnValue(startTime + 200);

      const upEvent = createMockPointerEvent({
        clientX: 50,
        clientY: 100 - DEFAULT_MIN_SWIPE_DISTANCE - 10, // Up swipe beyond min distance
        target: mockNode,
        pointerType: 'touch',
        type: 'pointerup',
      });

      if (onUp) {
        onUp([], upEvent);
      }

      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'swipe',
          detail: {
            direction: 'top',
            target: mockNode,
            pointerType: 'touch',
          },
        })
      );
    });

    test('should not dispatch swipe event if timeframe exceeded', () => {
      const { onDown, onUp } = swipeComposition(mockNode);

      const startTime = Date.now();
      vi.spyOn(Date, 'now').mockReturnValue(startTime);

      const downEvent = createMockPointerEvent({
        clientX: 50,
        clientY: 60,
        target: mockNode,
        pointerType: 'touch',
      });

      const activeEvents = [downEvent];
      if (onDown) {
        onDown(activeEvents, downEvent);
      }

      // Move time forward beyond timeframe
      vi.spyOn(Date, 'now').mockReturnValue(startTime + DEFAULT_DELAY + 100);

      const upEvent = createMockPointerEvent({
        clientX: 50 + DEFAULT_MIN_SWIPE_DISTANCE + 10,
        clientY: 60,
        target: mockNode,
        pointerType: 'touch',
      });

      if (onUp) {
        onUp(activeEvents, upEvent);
      }

      expect(mockDispatchEvent).not.toHaveBeenCalled();
    });

    test('should not dispatch swipe event if distance is insufficient', () => {
      const { onDown, onUp } = swipeComposition(mockNode);

      const startTime = Date.now();
      vi.spyOn(Date, 'now').mockReturnValue(startTime);

      const downEvent = createMockPointerEvent({
        clientX: 50,
        clientY: 60,
        target: mockNode,
        pointerType: 'touch',
      });

      const activeEvents = [downEvent];
      if (onDown) {
        onDown(activeEvents, downEvent);
      }

      // Move time forward but within timeframe
      vi.spyOn(Date, 'now').mockReturnValue(startTime + 200);

      const upEvent = createMockPointerEvent({
        clientX: 50 + DEFAULT_MIN_SWIPE_DISTANCE - 10, // Distance below minimum
        clientY: 60,
        target: mockNode,
        pointerType: 'touch',
      });

      if (onUp) {
        onUp(activeEvents, upEvent);
      }

      expect(mockDispatchEvent).not.toHaveBeenCalled();
    });

    test('should handle custom parameters', () => {
      const customTimeframe = 500;
      const customMinDistance = 100;
      const { onDown, onUp } = swipeComposition(mockNode, {
        timeframe: customTimeframe,
        minSwipeDistance: customMinDistance,
      });

      const startTime = Date.now();
      vi.spyOn(Date, 'now').mockReturnValue(startTime);

      const downEvent = createMockPointerEvent({
        clientX: 50,
        clientY: 60,
        target: mockNode,
        pointerType: 'touch',
      });

      const activeEvents = [downEvent];
      if (onDown) {
        onDown(activeEvents, downEvent);
      }

      // Move time forward within custom timeframe
      vi.spyOn(Date, 'now').mockReturnValue(startTime + 400);

      const upEvent = createMockPointerEvent({
        clientX: 50 + customMinDistance + 10,
        clientY: 60,
        target: mockNode,
        pointerType: 'touch',
        type: 'pointerup',
      });

      if (onUp) {
        onUp([], upEvent);
      }

      expect(mockDispatchEvent).toHaveBeenCalled();
    });
  });

  describe('useSwipe', () => {
    test('should return object with swipe handler and attachment key', () => {
      const handler = vi.fn();
      const result = useSwipe(handler) as any;

      expect(result.onswipe).toBe(handler);
      expect(Object.keys(result)).toContain('onswipe');
      // Should have attachment key
      expect(Object.keys(result).length).toBe(1);
    });

    test('should include base handlers if provided', () => {
      const handler = vi.fn();
      const baseHandlers = {
        onswipedown: vi.fn(),
        onswipeup: vi.fn(),
      };

      const result = useSwipe(handler, undefined, baseHandlers) as any;

      expect(result.onswipe).toBe(handler);
      expect(result.onswipedown).toBe(baseHandlers.onswipedown);
      expect(result.onswipeup).toBe(baseHandlers.onswipeup);
    });
  });
});
