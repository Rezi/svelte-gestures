import { describe, expect, test, beforeEach, vi } from 'vitest';
import {
  multiTouchComposition,
  useMultiTouch,
  type MultiTouchParameters,
} from '../gestures/multi-touch/multi-touch.svelte';

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

describe('multi-touch.svelte.ts', () => {
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

  describe('multiTouchComposition', () => {
    test('should return correct gesture functions with default parameters', () => {
      const result = multiTouchComposition(mockNode);

      expect(typeof result.onDown).toBe('function');
      expect(result.onUp).toBe(null);
      expect(result.onMove).toBe(null);
      expect(result.plugins).toBeUndefined();
    });

    test('should handle custom parameters', () => {
      const customParams: Partial<MultiTouchParameters> = {
        composed: true,
        touchAction: 'pan-x',
      };

      const result = multiTouchComposition(mockNode, customParams);

      expect(result.onUp).toBe(null);
      expect(result.onMove).toBe(null);
      expect(typeof result.onDown).toBe('function');
    });

    test('should handle multiple pointers correctly', () => {
      const { onDown } = multiTouchComposition(mockNode);

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

      if (onDown) {
        onDown(activeEvents, event2); // Second pointer down
      }

      expect(mockDispatchEvent).toHaveBeenCalledTimes(1);

      const lastCall =
        mockDispatchEvent.mock.calls[mockDispatchEvent.mock.calls.length - 1];
      const dispatchedEvent = lastCall[0];

      // Check that a CustomEvent was dispatched
      expect(dispatchedEvent).toBeInstanceOf(CustomEvent);
      expect(dispatchedEvent.type).toBe('multiTouch');

      // Check the detail properties
      expect(dispatchedEvent.detail).toBeDefined();
      expect(typeof dispatchedEvent.detail.x).toBe('number');
      expect(typeof dispatchedEvent.detail.y).toBe('number');
      expect(dispatchedEvent.detail.pointerType).toBe('touch');
      expect(Array.isArray(dispatchedEvent.detail.coords)).toBe(true);
    });
    test('should work with different pointer types', () => {
      const { onDown } = multiTouchComposition(mockNode);

      const event1 = createMockPointerEvent({
        clientX: 50,
        clientY: 60,
        pointerId: 1,
        target: mockNode,
        pointerType: 'pen',
      });

      const event2 = createMockPointerEvent({
        clientX: 70,
        clientY: 80,
        pointerId: 2,
        target: mockNode,
        pointerType: 'pen',
      });

      const activeEvents = [event1, event2];

      if (onDown) {
        onDown(activeEvents, event2); // Second pointer down
      }

      expect(mockDispatchEvent).toHaveBeenCalledTimes(1);

      const lastCall =
        mockDispatchEvent.mock.calls[mockDispatchEvent.mock.calls.length - 1];
      const dispatchedEvent = lastCall[0];

      // Check that a CustomEvent was dispatched with correct pointer type
      expect(dispatchedEvent).toBeInstanceOf(CustomEvent);
      expect(dispatchedEvent.type).toBe('multiTouch');
      expect(dispatchedEvent.detail.pointerType).toBe('pen');
    });

    test('should handle move events with multiple pointers', () => {
      const { onMove } = multiTouchComposition(mockNode);

      // The implementation returns onMove as null
      expect(onMove).toBe(null);
    });
  });

  describe('useMultiTouch', () => {
    test('should return object with multitouch handler and attachment key', () => {
      const handler = vi.fn();
      const result = useMultiTouch(handler) as any;

      expect(result.onmultiTouch).toBe(handler);
      expect(Object.keys(result)).toContain('onmultiTouch');
      // Should have attachment key
      expect(Object.keys(result).length).toBe(1);
      expect(Object.getOwnPropertySymbols(result).length).toBe(1);
    });

    test('should include base handlers if provided', () => {
      const handler = vi.fn();
      const baseHandlers = {
        onmultiTouchdown: vi.fn(),
        onmultiTouchup: vi.fn(),
        onmultiTouchmove: vi.fn(),
      };

      const result = useMultiTouch(handler, undefined, baseHandlers) as any;

      expect(result.onmultiTouch).toBe(handler);
      expect(result.onmultiTouchdown).toBe(baseHandlers.onmultiTouchdown);
    });
  });
});
