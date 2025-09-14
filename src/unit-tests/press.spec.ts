import { describe, expect, test, beforeEach, vi } from 'vitest';
import {
  pressComposition,
  usePress,
  type PressParameters,
} from '../gestures/press/press.svelte';
import { DEFAULT_DELAY, DEFAULT_PRESS_SPREAD } from '../shared';

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

describe('press.svelte.ts', () => {
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

  describe('pressComposition', () => {
    test('should return correct gesture functions with default parameters', () => {
      const result = pressComposition(mockNode);

      expect(typeof result.onMove).toBe('function');
      expect(typeof result.onDown).toBe('function');
      expect(typeof result.onUp).toBe('function');
      expect(result.plugins).toBeUndefined();
    });

    test('should handle custom parameters', () => {
      const customParams: Partial<PressParameters> = {
        timeframe: 500,
        triggerBeforeFinished: true,
        spread: 10,
        composed: true,
        touchAction: 'pan-x',
      };

      const result = pressComposition(mockNode, customParams);

      expect(typeof result.onMove).toBe('function');
      expect(typeof result.onDown).toBe('function');
      expect(typeof result.onUp).toBe('function');
    });

    test('should start press timer on down', () => {
      const { onDown } = pressComposition(mockNode);
      const mockEvent = createMockPointerEvent({
        clientX: 50,
        clientY: 60,
        target: mockNode,
        pointerType: 'touch',
      });

      const activeEvents = [mockEvent];

      // Should not throw and should start the press timer
      if (onDown) {
        expect(() => onDown(activeEvents, mockEvent)).not.toThrow();
      }
    });

    test('should dispatch press event after timeframe without triggerBeforeFinished', async () => {
      vi.useFakeTimers();
      const { onDown, onUp } = pressComposition(mockNode);

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

      // Fast forward time to see if press is triggered
      vi.advanceTimersByTime(DEFAULT_DELAY + 50);

      if (onUp) {
        onUp(activeEvents, downEvent);
      }

      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'press',
          detail: {
            x: 40, // 50 - 10 (left offset)
            y: 40, // 60 - 20 (top offset)
            target: mockNode,
            pointerType: 'touch',
          },
        })
      );

      vi.useRealTimers();
    });
    test('should dispatch press event immediately with triggerBeforeFinished', async () => {
      vi.useFakeTimers();
      const { onDown } = pressComposition(mockNode, {
        triggerBeforeFinished: true,
      });

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

      // Fast forward time to see if press is triggered
      vi.advanceTimersByTime(DEFAULT_DELAY + 50);

      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'press',
          detail: {
            x: 40, // 50 - 10 (left offset)
            y: 40, // 60 - 20 (top offset)
            target: mockNode,
            pointerType: 'touch',
          },
        })
      );

      vi.useRealTimers();
    });

    test('should cancel press on move beyond spread limit', () => {
      vi.useFakeTimers();
      const { onDown, onMove, onUp } = pressComposition(mockNode);

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

      const moveEvent = createMockPointerEvent({
        clientX: 50 + DEFAULT_PRESS_SPREAD + 1, // Move beyond spread limit
        clientY: 60,
        target: mockNode,
        pointerType: 'touch',
      });

      if (onMove) {
        const result = onMove([moveEvent], moveEvent);
        expect(result).toBe(false);
      }

      // Fast forward time to see if press would have been triggered
      vi.advanceTimersByTime(DEFAULT_DELAY + 100);

      if (onUp) {
        onUp([], moveEvent);
      }

      expect(mockDispatchEvent).not.toHaveBeenCalled();

      vi.useRealTimers();
    });

    test('should not cancel press on move within spread limit', () => {
      vi.useFakeTimers();
      const { onDown, onMove, onUp } = pressComposition(mockNode);

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

      const moveEvent = createMockPointerEvent({
        clientX: 50 + DEFAULT_PRESS_SPREAD - 1, // Move within spread limit
        clientY: 60,
        target: mockNode,
        pointerType: 'touch',
      });

      if (onMove) {
        const result = onMove([moveEvent], moveEvent);
        expect(result).toBe(false);
      }

      // Fast forward time to see if press is triggered
      vi.advanceTimersByTime(DEFAULT_DELAY + 100);

      if (onUp) {
        onUp(activeEvents, moveEvent);
      }

      expect(mockDispatchEvent).toHaveBeenCalled();

      vi.useRealTimers();
    });

    test('should cancel press on up before timeframe', () => {
      vi.useFakeTimers();
      const { onDown, onUp } = pressComposition(mockNode);

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

      // Trigger up before timeframe completes
      const upEvent = createMockPointerEvent({
        clientX: 50,
        clientY: 60,
        target: mockNode,
        pointerType: 'touch',
      });

      if (onUp) {
        onUp([], upEvent);
      }

      // Fast forward time to see if press would have been triggered
      vi.advanceTimersByTime(DEFAULT_DELAY + 100);
      expect(mockDispatchEvent).not.toHaveBeenCalled();

      vi.useRealTimers();
    });

    test('should handle custom timeframe parameter', async () => {
      vi.useFakeTimers();
      const customTimeframe = 100;
      const { onDown, onUp } = pressComposition(mockNode, {
        timeframe: customTimeframe,
      });

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

      // Fast forward time to see if press would have been triggered
      vi.advanceTimersByTime(customTimeframe + 100);

      if (onUp) {
        onUp(activeEvents, downEvent);
      }

      expect(mockDispatchEvent).toHaveBeenCalled();

      vi.useRealTimers();
    });

    test('should handle custom spread parameter', () => {
      vi.useFakeTimers();
      const customSpread = 10;
      const { onDown, onMove, onUp } = pressComposition(mockNode, {
        spread: customSpread,
      });

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

      const moveEvent = createMockPointerEvent({
        clientX: 50 + customSpread + 1, // Move beyond custom spread limit
        clientY: 60,
        target: mockNode,
        pointerType: 'touch',
      });

      if (onMove) {
        onMove([moveEvent], moveEvent);
      }

      // Fast forward time to see if press would have been triggered
      vi.advanceTimersByTime(DEFAULT_DELAY + 100);

      if (onUp) {
        onUp([], moveEvent);
      }
      expect(mockDispatchEvent).not.toHaveBeenCalled();

      vi.useRealTimers();
    });
  });

  describe('usePress', () => {
    test('should return object with press handler and attachment key', () => {
      const handler = vi.fn();
      const result = usePress(handler) as any;

      expect(result.onpress).toBe(handler);
      expect(Object.keys(result)).toContain('onpress');
      // Should have attachment key
      expect(Object.keys(result).length).toBe(1);
    });

    test('should include base handlers if provided', () => {
      const handler = vi.fn();
      const baseHandlers = {
        onpressdown: vi.fn(),
        onpressup: vi.fn(),
        onpressmove: vi.fn(),
      };

      const result = usePress(handler, undefined, baseHandlers) as any;

      expect(result.onpress).toBe(handler);
      expect(result.onpressdown).toBe(baseHandlers.onpressdown);
      expect(result.onpressup).toBe(baseHandlers.onpressup);
      expect(result.onpressmove).toBe(baseHandlers.onpressmove);
    });
  });
});
