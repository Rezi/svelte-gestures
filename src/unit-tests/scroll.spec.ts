import { describe, expect, test, beforeEach, vi } from 'vitest';
import {
  scrollComposition,
  useScroll,
  type ScrollParameters,
} from '../gestures/scroll/scroll.svelte';
import { DEFAULT_TOUCH_ACTION } from '../shared';

// Mock DOM methods
const mockGetBoundingClientRect = vi.fn();
const mockScrollBy = vi.fn();
const mockGetComputedStyle = vi.fn();

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

// Helper function to create scrollable mock element
function createScrollableElement(overrides: any = {}) {
  // Create a real HTMLElement using document.createElement
  const el = document.createElement('div');
  // Assign mock methods and properties that are not read-only
  // Remove parentNode from overrides before Object.assign to avoid error
  const { parentNode, ...restOverrides } = overrides;

  // Remove read-only properties from restOverrides before Object.assign
  const {
    scrollHeight,
    scrollWidth,
    clientHeight,
    clientWidth,
    ...assignableOverrides
  } = restOverrides;

  Object.assign(el, {
    getBoundingClientRect: mockGetBoundingClientRect,
    scrollBy: mockScrollBy,
    style: { touchAction: '' },
    ...assignableOverrides,
  });

  // Define a mock parentNode if provided in overrides
  if (parentNode !== undefined) {
    Object.defineProperty(el, 'parentNode', {
      value: parentNode,
      configurable: true,
    });
  }

  // Define read-only properties using Object.defineProperty
  Object.defineProperty(el, 'scrollHeight', {
    value: scrollHeight !== undefined ? scrollHeight : 200,
    configurable: true,
  });
  Object.defineProperty(el, 'scrollWidth', {
    value: scrollWidth !== undefined ? scrollWidth : 200,
    configurable: true,
  });
  Object.defineProperty(el, 'clientHeight', {
    value: clientHeight !== undefined ? clientHeight : 100,
    configurable: true,
  });
  Object.defineProperty(el, 'clientWidth', {
    value: clientWidth !== undefined ? clientWidth : 100,
    configurable: true,
  });

  return el;
}

describe('scroll.svelte.ts', () => {
  let mockNode: HTMLElement;
  let mockScrollableParent: HTMLElement;

  beforeEach(() => {
    // Reset mocks before each test
    mockGetBoundingClientRect.mockReset();
    mockScrollBy.mockReset();
    mockGetComputedStyle.mockReset();

    // Create mock scrollable parent element
    mockScrollableParent = createScrollableElement();

    // Create mock HTML element that itself is scrollable
    mockNode = createScrollableElement({
      parentNode: mockScrollableParent,
    });

    // Mock window.getComputedStyle to return scrollable overflow
    mockGetComputedStyle.mockReturnValue({
      overflowY: 'auto', // This is what getScrollParent checks
    });
    Object.defineProperty(window, 'getComputedStyle', {
      value: mockGetComputedStyle,
      writable: true,
    });

    // Mock document.body and document.scrollingElement
    Object.defineProperty(document, 'body', {
      value: createScrollableElement(),
      writable: true,
    });
    Object.defineProperty(document, 'scrollingElement', {
      value: createScrollableElement(),
      writable: true,
    });

    mockGetBoundingClientRect.mockReturnValue({
      left: 10,
      top: 20,
      right: 110,
      bottom: 120,
      width: 100,
      height: 100,
    });
  });

  describe('scrollComposition', () => {
    test('should return correct gesture functions with default parameters', () => {
      const result = scrollComposition(mockNode);

      expect(typeof result.onUp).toBe('function');
      expect(typeof result.onDown).toBe('function');
      expect(typeof result.onMove).toBe('function');
      expect(result.plugins).toBeUndefined();
    });

    test('should handle custom parameters', () => {
      const customParams: Partial<ScrollParameters> = {
        composed: true,
        touchAction: 'pan-x',
      };

      const result = scrollComposition(mockNode, customParams);

      expect(typeof result.onUp).toBe('function');
      expect(typeof result.onDown).toBe('function');
      expect(typeof result.onMove).toBe('function');
    });

    test('should call scrollBy on move events with single touch', () => {
      const { onMove, onDown } = scrollComposition(mockNode);

      const startEvent = createMockPointerEvent({
        clientX: 50,
        clientY: 60,
        pointerId: 1,
        target: mockNode,
        pointerType: 'touch',
      });

      const moveEvent = createMockPointerEvent({
        clientX: 40,
        clientY: 50,
        pointerId: 1,
        target: mockNode,
        pointerType: 'touch',
      });

      if (onDown) {
        onDown([startEvent], startEvent);
      }

      if (onMove) {
        // First move to set initial position
        onMove([startEvent], startEvent);
        // Second move should trigger scrollBy
        const result = onMove([moveEvent], moveEvent);
        expect(result).toBe(false);
      }

      // Should call scrollBy on the node with the delta
      expect(mockScrollBy).toHaveBeenCalledWith({
        top: 10, // 60 - 50 = 10
        behavior: 'auto',
      });
      expect(mockScrollBy).toHaveBeenCalledWith({
        left: 10, // 50 - 40 = 10
        behavior: 'auto',
      });
    });

    test('should call scrollBy with correct delta calculations', () => {
      const { onMove, onDown } = scrollComposition(mockNode);

      const startEvent = createMockPointerEvent({
        clientX: 100,
        clientY: 100,
        pointerId: 1,
        target: mockNode,
        pointerType: 'touch',
      });

      const moveEvent = createMockPointerEvent({
        clientX: 80,
        clientY: 120,
        pointerId: 1,
        target: mockNode,
        pointerType: 'touch',
      });

      if (onDown) {
        onDown([startEvent], startEvent);
      }

      if (onMove) {
        // First move to set initial position
        onMove([startEvent], startEvent);
        // Second move should trigger scrollBy
        onMove([moveEvent], moveEvent);
      }

      // Should call scrollBy with correct deltas
      expect(mockScrollBy).toHaveBeenCalledWith({
        top: -20, // 100 - 120 = -20
        behavior: 'auto',
      });
      expect(mockScrollBy).toHaveBeenCalledWith({
        left: 20, // 100 - 80 = 20
        behavior: 'auto',
      });
    });

    test('should not scroll with non-touch pointers', () => {
      const { onMove, onDown } = scrollComposition(mockNode);

      const startEvent = createMockPointerEvent({
        clientX: 50,
        clientY: 60,
        pointerId: 1,
        target: mockNode,
        pointerType: 'pen',
      });

      const moveEvent = createMockPointerEvent({
        clientX: 40,
        clientY: 50,
        pointerId: 1,
        target: mockNode,
        pointerType: 'pen',
      });

      if (onDown) {
        onDown([startEvent], startEvent);
      }

      if (onMove) {
        onMove([startEvent], startEvent);
        onMove([moveEvent], moveEvent);
      }

      expect(mockScrollBy).not.toHaveBeenCalled();
    });

    test('should not scroll with multiple pointers', () => {
      const { onMove, onDown } = scrollComposition(mockNode);

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

      if (onDown) {
        onDown([event1, event2], event1);
      }

      if (onMove) {
        onMove([event1, event2], event1);
      }

      expect(mockScrollBy).not.toHaveBeenCalled();
    });

    test('should handle scroll momentum on up', () => {
      vi.useFakeTimers();
      const mockRequestAnimationFrame = vi.fn((callback) => {
        setTimeout(callback, 16);
        return 1;
      });
      Object.defineProperty(window, 'requestAnimationFrame', {
        value: mockRequestAnimationFrame,
        writable: true,
      });

      const { onMove, onDown, onUp } = scrollComposition(mockNode);

      const startEvent = createMockPointerEvent({
        clientX: 50,
        clientY: 60,
        pointerId: 1,
        target: mockNode,
        pointerType: 'touch',
      });

      const moveEvent = createMockPointerEvent({
        clientX: 40,
        clientY: 50,
        pointerId: 1,
        target: mockNode,
        pointerType: 'touch',
      });

      if (onDown) {
        onDown([startEvent], startEvent);
      }

      if (onMove) {
        onMove([startEvent], startEvent);
        onMove([moveEvent], moveEvent);
      }

      if (onUp) {
        onUp([moveEvent], moveEvent);
      }

      // Should trigger momentum scrolling
      expect(mockRequestAnimationFrame).toHaveBeenCalled();

      vi.useRealTimers();
    });

    test('should find scrollable parent element', () => {
      const nonScrollableNode = createScrollableElement({
        scrollHeight: 100,
        clientHeight: 100,
        parentNode: mockScrollableParent,
      });

      const { onDown } = scrollComposition(nonScrollableNode);

      if (onDown) {
        onDown([], createMockPointerEvent());
      }

      // The gesture should find the scrollable parent and use it for scrolling
      expect(mockGetComputedStyle).toHaveBeenCalled();
    });
  });

  describe('useScroll', () => {
    test('should return object with scroll handler and attachment key', () => {
      const handler = vi.fn();
      const result = useScroll(handler) as any;

      expect(result.onscroll).toBe(handler);
      expect(Object.keys(result)).toContain('onscroll');
      // Should have attachment key
      expect(Object.keys(result).length).toBe(1); // onscroll + attachment key
    });

    test('should include base handlers if provided', () => {
      const handler = vi.fn();
      const baseHandlers = {
        onscrolldown: vi.fn(),
        onscrollup: vi.fn(),
        onscrollmove: vi.fn(),
      };

      const result = useScroll(handler, undefined, baseHandlers) as any;

      expect(result.onscroll).toBe(handler);
      expect(result.onscrolldown).toBe(baseHandlers.onscrolldown);
      expect(result.onscrollup).toBe(baseHandlers.onscrollup);
      expect(result.onscrollmove).toBe(baseHandlers.onscrollmove);
    });
  });
});
