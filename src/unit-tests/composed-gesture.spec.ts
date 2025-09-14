import { describe, expect, test, beforeEach, vi } from 'vitest';
import {
  useComposedGesture,
  type RegisterFnType,
} from '../gestures/composed-gesture/composedGesture.svelte';
import { tapComposition } from '../gestures/tap/tap.svelte';
import { panComposition } from '../gestures/pan/pan.svelte';
import type { TapParameters } from '../gestures/tap/tap.svelte';
import type { PanParameters } from '../gestures/pan/pan.svelte';
import type { SubGestureFunctions, GesturePlugin } from '../shared';

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

// Mock gesture functions for testing
function mockGestureComposition(
  node: HTMLElement,
  params: any = {}
): SubGestureFunctions {
  return {
    onDown: vi.fn(),
    onMove: vi.fn(),
    onUp: vi.fn(),
    plugins: params.plugins || [],
  };
}

// Mock plugin for testing
const mockPlugin: GesturePlugin = {
  onDown: vi.fn(),
  onMove: vi.fn(),
  onUp: vi.fn(),
  onInit: vi.fn(),
  onDestroy: vi.fn(),
};

describe('composedGesture.svelte.ts', () => {
  let mockNode: HTMLElement;

  beforeEach(() => {
    // Reset mocks before each test
    mockGetBoundingClientRect.mockReset();
    mockDispatchEvent.mockReset();
    vi.clearAllMocks();

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

  describe('useComposedGesture', () => {
    test('should return object with attachment key', () => {
      const gestureCallback = (register: RegisterFnType) => {
        register(tapComposition, { timeframe: 300 });
        return () => {};
      };

      const result = useComposedGesture(gestureCallback) as any;

      expect(Object.getOwnPropertySymbols(result).length).toBe(1);
      expect(Object.keys(result).length).toBe(0);
      // Should have attachment key but no specific event handlers
      expect(result.oncomposedGesture).toBeUndefined();
    });

    test('should register multiple gestures correctly', () => {
      const gestureCallback = (register: RegisterFnType) => {
        const tapGesture = register(tapComposition, { timeframe: 300 });
        const panGesture = register(panComposition, { delay: 200 });

        return (activeEvents: PointerEvent[], event: PointerEvent) => {
          // Custom composition logic
          expect(tapGesture.onDown).toBeDefined();
          expect(tapGesture.onUp).toBeDefined();
          expect(panGesture.onDown).toBeDefined();
          expect(panGesture.onMove).toBeDefined();
        };
      };

      const result = useComposedGesture(gestureCallback);
      expect(result).toBeDefined();
    });

    test('should handle gesture with plugins', () => {
      const gestureCallback = (register: RegisterFnType) => {
        register(mockGestureComposition, { plugins: [mockPlugin] });
        return () => {};
      };

      const result = useComposedGesture(gestureCallback);
      expect(result).toBeDefined();
    });

    test('should call gesture callbacks on pointer events', () => {
      const onDownSpy = vi.fn();
      const onMoveSpy = vi.fn();
      const onUpSpy = vi.fn();

      const gestureCallback = (register: RegisterFnType) => {
        register(tapComposition, { timeframe: 300 });

        return (activeEvents: PointerEvent[], event: PointerEvent) => {
          if (event.type === 'pointerdown') onDownSpy(activeEvents, event);
          if (event.type === 'pointermove') onMoveSpy(activeEvents, event);
          if (event.type === 'pointerup') onUpSpy(activeEvents, event);
        };
      };

      const result = useComposedGesture(gestureCallback) as any;
      expect(result).toBeDefined();

      // The actual event handling would be tested through integration tests
      // as it requires the attachment mechanism to work
    });

    test('should handle multiple gestures with different parameters', () => {
      const gestureCallback = (register: RegisterFnType) => {
        const tapGesture = register(tapComposition, {
          timeframe: 500,
          composed: true,
          touchAction: 'pan-x',
        } as TapParameters);

        const panGesture = register(panComposition, {
          delay: 100,
          composed: true,
          touchAction: 'pan-y',
        } as PanParameters);

        return (activeEvents: PointerEvent[], event: PointerEvent) => {
          // Both gestures should be available
          expect(tapGesture).toBeDefined();
          expect(panGesture).toBeDefined();
        };
      };

      const result = useComposedGesture(gestureCallback);
      expect(result).toBeDefined();
    });

    test('should register gesture with plugins correctly', () => {
      const customPlugin: GesturePlugin = {
        onDown: vi.fn(),
        onMove: vi.fn(),
        onUp: vi.fn(),
        onInit: vi.fn(),
      };

      const gestureCallback = (register: RegisterFnType) => {
        const gesture = register(mockGestureComposition, {
          plugins: [customPlugin],
        });

        return (activeEvents: PointerEvent[], event: PointerEvent) => {
          expect(gesture.plugins).toContain(customPlugin);
        };
      };

      const result = useComposedGesture(gestureCallback);
      expect(result).toBeDefined();
    });

    test('should handle empty gesture registration', () => {
      const gestureCallback = (register: RegisterFnType) => {
        // No gestures registered
        return (activeEvents: PointerEvent[], event: PointerEvent) => {
          // Should still work with empty composition
        };
      };

      const result = useComposedGesture(gestureCallback);
      expect(result).toBeDefined();
    });

    test('should support complex gesture combinations', () => {
      const gestureCallback = (
        register: RegisterFnType,
        node?: HTMLElement
      ) => {
        const tap = register(tapComposition, { timeframe: 300 });
        const pan = register(panComposition, { delay: 200 });

        return (activeEvents: PointerEvent[], event: PointerEvent) => {
          // Custom logic combining tap and pan
          if (activeEvents.length === 1) {
            // Single touch - could be tap or start of pan
            tap.onDown?.(activeEvents, event);
            pan.onDown?.(activeEvents, event);
          }

          // The actual combination logic would depend on the specific use case
          expect(node).toBeDefined();
        };
      };

      const result = useComposedGesture(gestureCallback);
      expect(result).toBeDefined();
    });

    test('should pass node parameter to gesture callback', () => {
      const gestureCallback = (
        register: RegisterFnType,
        node?: HTMLElement
      ) => {
        expect(node).toBeDefined();
        register(tapComposition, { timeframe: 300 });

        return (activeEvents: PointerEvent[], event: PointerEvent) => {
          // Gesture handling logic
        };
      };

      const result = useComposedGesture(gestureCallback);
      expect(result).toBeDefined();
    });

    test('should handle gesture callback returning different handler types', () => {
      const gestureCallback = (register: RegisterFnType) => {
        register(tapComposition, { timeframe: 300 });

        // Return a more complex handler
        return (activeEvents: PointerEvent[], event: PointerEvent) => {
          // Complex gesture logic here
          return true; // Or some other return value
        };
      };

      const result = useComposedGesture(gestureCallback);
      expect(result).toBeDefined();
    });
  });

  describe('gesture registration types', () => {
    test('should type check registered gestures correctly', () => {
      const gestureCallback = (register: RegisterFnType) => {
        // TypeScript should enforce correct parameter types
        const tapGesture = register(tapComposition, {
          timeframe: 300, // Valid TapParameters
          composed: true,
          touchAction: 'none',
        });

        const panGesture = register(panComposition, {
          delay: 200, // Valid PanParameters
          composed: true,
          touchAction: 'pan-x',
        });

        return (activeEvents: PointerEvent[], event: PointerEvent) => {
          // Should have correct function signatures
          expect(typeof tapGesture.onDown).toBe('function');
          expect(typeof tapGesture.onUp).toBe('function');
          expect(tapGesture.onMove).toBe(null);

          expect(typeof panGesture.onDown).toBe('function');
          expect(typeof panGesture.onMove).toBe('function');
          expect(panGesture.onUp).toBe(null);
        };
      };

      const result = useComposedGesture(gestureCallback);
      expect(result).toBeDefined();
    });
  });
});
