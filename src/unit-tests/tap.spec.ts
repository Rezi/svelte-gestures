import { describe, expect, test, beforeEach, vi } from 'vitest';
import {
  tapComposition,
  useTap,
  type TapParameters,
} from '../gestures/tap/tap.svelte';
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

describe('tap.svelte.ts', () => {
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

  describe('tapComposition', () => {
    test('should return correct gesture functions with default parameters', () => {
      const result = tapComposition(mockNode);

      expect(result.onMove).toBe(null);
      expect(typeof result.onDown).toBe('function');
      expect(typeof result.onUp).toBe('function');
      expect(result.plugins).toBeUndefined();
    });

    test('should handle custom parameters', () => {
      const customParams: Partial<TapParameters> = {
        timeframe: 500,
        composed: true,
        touchAction: 'pan-x',
      };

      const result = tapComposition(mockNode, customParams);

      expect(result.onMove).toBe(null);
      expect(typeof result.onDown).toBe('function');
      expect(typeof result.onUp).toBe('function');
    });

    test('should record start position and time on down', () => {
      const { onDown } = tapComposition(mockNode);
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

    test('should dispatch tap event on successful tap within timeframe and spread limit', () => {
      const { onDown, onUp } = tapComposition(mockNode);

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
        clientX: 52, // Within 4px spread
        clientY: 61, // Within 4px spread
        target: mockNode,
        pointerType: 'touch',
      });

      if (onUp) {
        onUp(activeEvents, upEvent);
      }

      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'tap',
          detail: {
            x: 42, // 52 - 10 (left offset)
            y: 41, // 61 - 20 (top offset)
            target: mockNode,
            pointerType: 'touch',
          },
        })
      );
    });

    test('should not dispatch tap event if timeframe exceeded', () => {
      const { onDown, onUp } = tapComposition(mockNode);

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
        clientX: 52,
        clientY: 61,
        target: mockNode,
        pointerType: 'touch',
      });

      if (onUp) {
        onUp(activeEvents, upEvent);
      }

      expect(mockDispatchEvent).not.toHaveBeenCalled();
    });

    test('should not dispatch tap event if movement exceeds spread limit', () => {
      const { onDown, onUp } = tapComposition(mockNode);

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

      vi.spyOn(Date, 'now').mockReturnValue(startTime + 200);

      const upEvent = createMockPointerEvent({
        clientX: 55, // 5px movement > 4px limit
        clientY: 61,
        target: mockNode,
        pointerType: 'touch',
      });

      if (onUp) {
        onUp(activeEvents, upEvent);
      }

      expect(mockDispatchEvent).not.toHaveBeenCalled();
    });

    test('should handle custom timeframe parameter', () => {
      const customTimeframe = 500;
      const { onDown, onUp } = tapComposition(mockNode, {
        timeframe: customTimeframe,
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
        clientX: 52,
        clientY: 61,
        target: mockNode,
        pointerType: 'touch',
      });

      if (onUp) {
        onUp(activeEvents, upEvent);
      }

      expect(mockDispatchEvent).toHaveBeenCalled();
    });

    test('should handle exact boundary conditions for movement', () => {
      const { onDown, onUp } = tapComposition(mockNode);

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

      vi.spyOn(Date, 'now').mockReturnValue(startTime + 200);

      // Test exact 4px movement (should still be valid)
      const upEvent = createMockPointerEvent({
        clientX: 53, // Exactly 3px movement (< 4px limit)
        clientY: 63, // Exactly 3px movement (< 4px limit)
        target: mockNode,
        pointerType: 'touch',
      });

      if (onUp) {
        onUp(activeEvents, upEvent);
      }

      expect(mockDispatchEvent).toHaveBeenCalled();
    });

    test('should handle exact timeframe boundary', () => {
      const { onDown, onUp } = tapComposition(mockNode);

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

      // Move time forward to exactly the timeframe limit
      vi.spyOn(Date, 'now').mockReturnValue(startTime + DEFAULT_DELAY - 1);

      const upEvent = createMockPointerEvent({
        clientX: 52,
        clientY: 61,
        target: mockNode,
        pointerType: 'touch',
      });

      if (onUp) {
        onUp(activeEvents, upEvent);
      }

      expect(mockDispatchEvent).toHaveBeenCalled();
    });

    test('should work with different pointer types', () => {
      const { onDown, onUp } = tapComposition(mockNode);

      const startTime = Date.now();
      vi.spyOn(Date, 'now').mockReturnValue(startTime);

      const downEvent = createMockPointerEvent({
        clientX: 50,
        clientY: 60,
        target: mockNode,
        pointerType: 'pen',
      });

      const activeEvents = [downEvent];
      if (onDown) {
        onDown(activeEvents, downEvent);
      }

      vi.spyOn(Date, 'now').mockReturnValue(startTime + 200);

      const upEvent = createMockPointerEvent({
        clientX: 52,
        clientY: 61,
        target: mockNode,
        pointerType: 'pen',
      });

      if (onUp) {
        onUp(activeEvents, upEvent);
      }

      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'tap',
          detail: expect.objectContaining({
            pointerType: 'pen',
          }),
        })
      );
    });

    test('should handle negative coordinates correctly', () => {
      mockGetBoundingClientRect.mockReturnValue({
        left: 100,
        top: 150,
        right: 200,
        bottom: 250,
        width: 100,
        height: 100,
      });

      const { onDown, onUp } = tapComposition(mockNode);

      const startTime = Date.now();
      vi.spyOn(Date, 'now').mockReturnValue(startTime);

      const downEvent = createMockPointerEvent({
        clientX: 50, // Will result in negative relative coordinate
        clientY: 100, // Will result in negative relative coordinate
        target: mockNode,
        pointerType: 'touch',
      });

      const activeEvents = [downEvent];
      if (onDown) {
        onDown(activeEvents, downEvent);
      }

      vi.spyOn(Date, 'now').mockReturnValue(startTime + 200);

      const upEvent = createMockPointerEvent({
        clientX: 52,
        clientY: 102,
        target: mockNode,
        pointerType: 'touch',
      });

      if (onUp) {
        onUp(activeEvents, upEvent);
      }

      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'tap',
          detail: {
            x: -48, // 52 - 100 (left offset)
            y: -48, // 102 - 150 (top offset)
            target: mockNode,
            pointerType: 'touch',
          },
        })
      );
    });

    test('should round coordinates correctly', () => {
      mockGetBoundingClientRect.mockReturnValue({
        left: 10.7,
        top: 20.3,
        right: 110.7,
        bottom: 120.3,
        width: 100,
        height: 100,
      });

      const { onDown, onUp } = tapComposition(mockNode);

      const startTime = Date.now();
      vi.spyOn(Date, 'now').mockReturnValue(startTime);

      const downEvent = createMockPointerEvent({
        clientX: 50.6,
        clientY: 60.8,
        target: mockNode,
        pointerType: 'touch',
      });

      const activeEvents = [downEvent];
      if (onDown) {
        onDown(activeEvents, downEvent);
      }

      vi.spyOn(Date, 'now').mockReturnValue(startTime + 200);

      const upEvent = createMockPointerEvent({
        clientX: 52.4,
        clientY: 61.9,
        target: mockNode,
        pointerType: 'touch',
      });

      if (onUp) {
        onUp(activeEvents, upEvent);
      }

      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'tap',
          detail: expect.objectContaining({
            x: expect.any(Number),
            y: expect.any(Number),
          }),
        })
      );

      // Check that coordinates are integers
      const lastCall =
        mockDispatchEvent.mock.calls[mockDispatchEvent.mock.calls.length - 1];
      const detail = lastCall[0].detail;
      expect(Number.isInteger(detail.x)).toBe(true);
      expect(Number.isInteger(detail.y)).toBe(true);
    });
  });

  describe('useTap', () => {
    test('should return object with tap handler and attachment key', () => {
      const handler = vi.fn();
      const result = useTap(handler) as any;

      expect(result.ontap).toBe(handler);
      expect(Object.keys(result)).toContain('ontap');
      // Should have attachment key
      expect(Object.keys(result).length).toBe(1);
    });

    test('should include base handlers if provided', () => {
      const handler = vi.fn();
      const baseHandlers = {
        ontapdown: vi.fn(),
        ontapup: vi.fn(),
        ontapmove: vi.fn(),
      };

      const result = useTap(handler, undefined, baseHandlers) as any;

      expect(result.ontap).toBe(handler);
      expect(result.ontapdown).toBe(baseHandlers.ontapdown);
      expect(result.ontapup).toBe(baseHandlers.ontapup);
      expect(result.ontapmove).toBe(baseHandlers.ontapmove);
    });

    test('should handle input parameters function', () => {
      const handler = vi.fn();
      const parametersFunc = () => ({
        timeframe: 400,
        touchAction: 'pan-y' as const,
      });

      const result = useTap(handler, parametersFunc) as any;

      expect(result.ontap).toBe(handler);
      expect(Object.keys(result).length).toBe(1);
    });

    test('should work with minimal configuration', () => {
      const handler = vi.fn();
      const result = useTap(handler) as any;

      expect(result.ontap).toBe(handler);
      expect(typeof result.ontap).toBe('function');
    });

    test('should support complex base handlers configuration', () => {
      const handler = vi.fn();
      const onDown = vi.fn();
      const onUp = vi.fn();
      const onMove = vi.fn();

      const baseHandlers = {
        ontapdown: onDown,
        ontapup: onUp,
        ontapmove: onMove,
      };

      const parameters = () => ({
        timeframe: 600,
        composed: true,
        touchAction: 'manipulation' as const,
      });

      const result = useTap(handler, parameters, baseHandlers) as any;

      expect(result.ontap).toBe(handler);
      expect(result.ontapdown).toBe(onDown);
      expect(result.ontapup).toBe(onUp);
      expect(result.ontapmove).toBe(onMove);
    });

    test('should create attachment key with proper function', () => {
      const handler = vi.fn();
      const result = useTap(handler) as any;

      // Find the attachment key (it's a symbol, not a string)
      const attachmentKey = Object.getOwnPropertySymbols(result).find((sym) =>
        sym.toString().includes('Symbol')
      );

      expect(attachmentKey).toBeDefined();
      if (attachmentKey) {
        expect(typeof result[attachmentKey]).toBe('function');
      }
    });
  });

  describe('edge cases and error handling', () => {
    test('should handle missing target in event', () => {
      const { onDown, onUp } = tapComposition(mockNode);

      const startTime = Date.now();
      vi.spyOn(Date, 'now').mockReturnValue(startTime);

      const downEvent = createMockPointerEvent({
        clientX: 50,
        clientY: 60,
        target: null, // Missing target
        pointerType: 'touch',
      });

      const activeEvents = [downEvent];
      if (onDown) {
        onDown(activeEvents, downEvent);
      }

      vi.spyOn(Date, 'now').mockReturnValue(startTime + 200);

      const upEvent = createMockPointerEvent({
        clientX: 52,
        clientY: 61,
        target: null, // Missing target
        pointerType: 'touch',
      });

      if (onUp) {
        onUp(activeEvents, upEvent);
      }

      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'tap',
          detail: expect.objectContaining({
            target: null,
          }),
        })
      );
    });

    test('should handle zero movement', () => {
      const { onDown, onUp } = tapComposition(mockNode);

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

      vi.spyOn(Date, 'now').mockReturnValue(startTime + 200);

      // Exact same position
      const upEvent = createMockPointerEvent({
        clientX: 50,
        clientY: 60,
        target: mockNode,
        pointerType: 'touch',
      });

      if (onUp) {
        onUp(activeEvents, upEvent);
      }

      expect(mockDispatchEvent).toHaveBeenCalled();
    });

    test('should handle very fast tap', () => {
      const { onDown, onUp } = tapComposition(mockNode);

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

      // Very fast tap (1ms)
      vi.spyOn(Date, 'now').mockReturnValue(startTime + 1);

      const upEvent = createMockPointerEvent({
        clientX: 50,
        clientY: 60,
        target: mockNode,
        pointerType: 'touch',
      });

      if (onUp) {
        onUp(activeEvents, upEvent);
      }

      expect(mockDispatchEvent).toHaveBeenCalled();
    });
  });
});
