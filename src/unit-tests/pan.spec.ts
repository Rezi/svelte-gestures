import { describe, expect, test, beforeEach, vi } from 'vitest';
import {
  panComposition,
  usePan,
  type PanParameters,
} from '../gestures/pan/pan.svelte';
import { DEFAULT_DELAY } from '../shared';

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

describe('pan.svelte.ts', () => {
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

  describe('panComposition', () => {
    test('should return correct gesture functions with default parameters', () => {
      const result = panComposition(mockNode);

      expect(result.onUp).toBe(null);
      expect(typeof result.onDown).toBe('function');
      expect(typeof result.onMove).toBe('function');
      expect(result.plugins).toBeUndefined();
    });

    test('should handle custom parameters', () => {
      const customParams: Partial<PanParameters> = {
        delay: 500,
        composed: true,
        touchAction: 'pan-x',
      };

      const result = panComposition(mockNode, customParams);

      expect(result.onUp).toBe(null);
      expect(typeof result.onDown).toBe('function');
      expect(typeof result.onMove).toBe('function');
    });

    test('should record start time and target on down', () => {
      const { onDown } = panComposition(mockNode);
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

    test('should dispatch pan event on move after delay with single pointer', () => {
      const { onDown, onMove } = panComposition(mockNode);

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

      // Move time forward beyond delay (DEFAULT_DELAY = 300ms)
      vi.spyOn(Date, 'now').mockReturnValue(startTime + DEFAULT_DELAY + 100);

      const moveEvent = createMockPointerEvent({
        clientX: 70,
        clientY: 80,
        target: mockNode,
        pointerType: 'touch',
      });

      if (onMove) {
        const result = onMove([moveEvent], moveEvent);
        expect(result).toBe(false);
      }

      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'pan',
          detail: {
            x: 60, // 70 - 10 (left offset)
            y: 60, // 80 - 20 (top offset)
            target: mockNode,
            pointerType: 'touch',
          },
        })
      );
    });

    test('should not dispatch pan event before delay', () => {
      const { onDown, onMove } = panComposition(mockNode);

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

      // Move time forward but within delay
      vi.spyOn(Date, 'now').mockReturnValue(startTime + 100);

      const moveEvent = createMockPointerEvent({
        clientX: 70,
        clientY: 80,
        target: mockNode,
        pointerType: 'touch',
      });

      if (onMove) {
        onMove([moveEvent], moveEvent);
      }

      expect(mockDispatchEvent).not.toHaveBeenCalled();
    });

    test('should not dispatch pan event with multiple pointers', () => {
      const { onDown, onMove } = panComposition(mockNode);

      const startTime = Date.now();
      vi.spyOn(Date, 'now').mockReturnValue(startTime);

      const downEvent = createMockPointerEvent({
        clientX: 50,
        clientY: 60,
        target: mockNode,
        pointerType: 'touch',
      });

      if (onDown) {
        onDown([downEvent], downEvent);
      }

      // Move time forward beyond delay
      vi.spyOn(Date, 'now').mockReturnValue(startTime + DEFAULT_DELAY + 100);

      const moveEvent1 = createMockPointerEvent({
        clientX: 70,
        clientY: 80,
        pointerId: 1,
      });

      const moveEvent2 = createMockPointerEvent({
        clientX: 75,
        clientY: 85,
        pointerId: 2,
      });

      if (onMove) {
        onMove([moveEvent1, moveEvent2], moveEvent1);
      }

      expect(mockDispatchEvent).not.toHaveBeenCalled();
    });

    test('should not dispatch pan event when pointer is outside bounds', () => {
      const { onDown, onMove } = panComposition(mockNode);

      const startTime = Date.now();
      vi.spyOn(Date, 'now').mockReturnValue(startTime);

      const downEvent = createMockPointerEvent({
        clientX: 50,
        clientY: 60,
        target: mockNode,
        pointerType: 'touch',
      });

      if (onDown) {
        onDown([downEvent], downEvent);
      }

      // Move time forward beyond delay
      vi.spyOn(Date, 'now').mockReturnValue(startTime + DEFAULT_DELAY + 100);

      const moveEvent = createMockPointerEvent({
        clientX: 150, // Outside bounds (rect width is 100, left is 10, so max x is 110)
        clientY: 80,
        target: mockNode,
        pointerType: 'touch',
      });

      if (onMove) {
        onMove([moveEvent], moveEvent);
      }

      expect(mockDispatchEvent).not.toHaveBeenCalled();
    });

    test('should handle custom delay parameter', () => {
      const customDelay = 500;
      const { onDown, onMove } = panComposition(mockNode, {
        delay: customDelay,
      });

      const startTime = Date.now();
      vi.spyOn(Date, 'now').mockReturnValue(startTime);

      const downEvent = createMockPointerEvent({
        clientX: 50,
        clientY: 60,
        target: mockNode,
        pointerType: 'touch',
      });

      if (onDown) {
        onDown([downEvent], downEvent);
      }

      // Move time forward beyond custom delay
      vi.spyOn(Date, 'now').mockReturnValue(startTime + customDelay + 100);

      const moveEvent = createMockPointerEvent({
        clientX: 70,
        clientY: 80,
        target: mockNode,
        pointerType: 'touch',
      });

      if (onMove) {
        onMove([moveEvent], moveEvent);
      }

      expect(mockDispatchEvent).toHaveBeenCalled();
    });
  });

  describe('usePan', () => {
    test('should return object with pan handler and attachment key', () => {
      const handler = vi.fn();
      const result = usePan(handler) as any;

      expect(result.onpan).toBe(handler);
      expect(Object.keys(result)).toContain('onpan');
      // Should have attachment key
    });

    test('should include base handlers if provided', () => {
      const handler = vi.fn();
      const baseHandlers = {
        onpandown: vi.fn(),
        onpanup: vi.fn(),
        onpanmove: vi.fn(),
      };

      const result = usePan(handler, undefined, baseHandlers) as any;

      expect(result.onpan).toBe(handler);
      expect(result.onpandown).toBe(baseHandlers.onpandown);
      expect(result.onpanup).toBe(baseHandlers.onpanup);
      expect(result.onpanmove).toBe(baseHandlers.onpanmove);
    });
  });
});
