import { describe, expect, test, beforeEach, vi } from 'vitest';
import {
  ensureArray,
  getCenterOfTwoPoints,
  getEventPostionInNode,
  getDispatchEventData,
  DEFAULT_DELAY,
  DEFAULT_PRESS_SPREAD,
  DEFAULT_MIN_SWIPE_DISTANCE,
  DEFAULT_TOUCH_ACTION,
} from '../shared';

// Mock DOM methods
const mockGetBoundingClientRect = vi.fn();

describe('shared.ts', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockGetBoundingClientRect.mockReset();
  });

  describe('Constants', () => {
    test('DEFAULT_DELAY should be 300', () => {
      expect(DEFAULT_DELAY).toBe(300);
    });

    test('DEFAULT_PRESS_SPREAD should be 4', () => {
      expect(DEFAULT_PRESS_SPREAD).toBe(4);
    });

    test('DEFAULT_MIN_SWIPE_DISTANCE should be 60', () => {
      expect(DEFAULT_MIN_SWIPE_DISTANCE).toBe(60);
    });

    test('DEFAULT_TOUCH_ACTION should be none', () => {
      expect(DEFAULT_TOUCH_ACTION).toBe('none');
    });
  });

  describe('ensureArray', () => {
    test('Array should return itself', () => {
      expect(ensureArray([])).toEqual([]);
      expect(ensureArray([1, 2, 3])).toEqual([1, 2, 3]);
      expect(ensureArray(['a', 'b'])).toEqual(['a', 'b']);
    });

    test('Non Array should return wrapped string value into an array', () => {
      expect(ensureArray('TEST')).toEqual(['TEST']);
    });

    test('Non Array should return wrapped number value into an array', () => {
      expect(ensureArray(1)).toEqual([1]);
    });

    test('Non Array should return wrapped boolean value into an array', () => {
      expect(ensureArray(true)).toEqual([true]);
      expect(ensureArray(false)).toEqual([false]);
    });

    test('Non Array should return wrapped object value into an array', () => {
      const obj = { key: 'value' };
      expect(ensureArray(obj)).toEqual([obj]);
    });

    test('Non Array should return wrapped null/undefined value into an array', () => {
      expect(ensureArray(null)).toEqual([null]);
      expect(ensureArray(undefined)).toEqual([undefined]);
    });
  });

  describe('getCenterOfTwoPoints', () => {
    test('should calculate center point between two pointer events', () => {
      const mockNode = {
        getBoundingClientRect: mockGetBoundingClientRect,
      } as unknown as HTMLElement;

      mockGetBoundingClientRect.mockReturnValue({
        left: 10,
        top: 20,
        right: 110,
        bottom: 120,
      });

      const event1 = { clientX: 50, clientY: 60 } as PointerEvent;
      const event2 = { clientX: 90, clientY: 100 } as PointerEvent;

      const result = getCenterOfTwoPoints(mockNode, [event1, event2]);

      // Center calculation:
      // X: min(50, 90) + |50-90|/2 = 50 + 20 = 70, relative to node: 70 - 10 = 60
      // Y: min(60, 100) + |60-100|/2 = 60 + 20 = 80, relative to node: 80 - 20 = 60
      expect(result).toEqual({ x: 60, y: 60 });
    });

    test('should handle same position points', () => {
      const mockNode = {
        getBoundingClientRect: mockGetBoundingClientRect,
      } as unknown as HTMLElement;

      mockGetBoundingClientRect.mockReturnValue({
        left: 0,
        top: 0,
        right: 100,
        bottom: 100,
      });

      const event1 = { clientX: 50, clientY: 50 } as PointerEvent;
      const event2 = { clientX: 50, clientY: 50 } as PointerEvent;

      const result = getCenterOfTwoPoints(mockNode, [event1, event2]);

      expect(result).toEqual({ x: 50, y: 50 });
    });

    test('should round coordinates to integers', () => {
      const mockNode = {
        getBoundingClientRect: mockGetBoundingClientRect,
      } as unknown as HTMLElement;

      mockGetBoundingClientRect.mockReturnValue({
        left: 0.5,
        top: 0.7,
        right: 100,
        bottom: 100,
      });

      const event1 = { clientX: 10.3, clientY: 20.8 } as PointerEvent;
      const event2 = { clientX: 30.7, clientY: 40.2 } as PointerEvent;

      const result = getCenterOfTwoPoints(mockNode, [event1, event2]);

      // Should be rounded integers
      expect(Number.isInteger(result.x)).toBe(true);
      expect(Number.isInteger(result.y)).toBe(true);
    });
  });

  describe('getEventPostionInNode', () => {
    test('should calculate correct position relative to node', () => {
      const mockNode = {
        getBoundingClientRect: mockGetBoundingClientRect,
      } as unknown as HTMLElement;

      mockGetBoundingClientRect.mockReturnValue({
        left: 20,
        top: 30,
        right: 120,
        bottom: 130,
      });

      const event = {
        clientX: 70,
        clientY: 80,
      } as PointerEvent;

      const result = getEventPostionInNode(mockNode, event);

      expect(result).toEqual({
        x: 50, // 70 - 20
        y: 50, // 80 - 30
      });
    });

    test('should round coordinates to integers', () => {
      const mockNode = {
        getBoundingClientRect: mockGetBoundingClientRect,
      } as unknown as HTMLElement;

      mockGetBoundingClientRect.mockReturnValue({
        left: 10.7,
        top: 15.3,
        right: 110,
        bottom: 115,
      });

      const event = {
        clientX: 25.9,
        clientY: 35.2,
      } as PointerEvent;

      const result = getEventPostionInNode(mockNode, event);

      expect(Number.isInteger(result.x)).toBe(true);
      expect(Number.isInteger(result.y)).toBe(true);
    });

    test('should handle negative relative positions', () => {
      const mockNode = {
        getBoundingClientRect: mockGetBoundingClientRect,
      } as unknown as HTMLElement;

      mockGetBoundingClientRect.mockReturnValue({
        left: 50,
        top: 60,
        right: 150,
        bottom: 160,
      });

      const event = {
        clientX: 30,
        clientY: 40,
      } as PointerEvent;

      const result = getEventPostionInNode(mockNode, event);

      expect(result).toEqual({
        x: -20, // 30 - 50
        y: -20, // 40 - 60
      });
    });
  });

  describe('getDispatchEventData', () => {
    test('should create correct dispatch event data', () => {
      const mockNode = {
        getBoundingClientRect: mockGetBoundingClientRect,
      } as unknown as HTMLElement;

      mockGetBoundingClientRect.mockReturnValue({
        left: 10,
        top: 20,
        right: 110,
        bottom: 120,
      });

      const mockTarget = document.createElement('div');
      const event = {
        clientX: 60,
        clientY: 70,
        target: mockTarget,
      } as unknown as PointerEvent;

      const activeEvents = [event, {} as PointerEvent, {} as PointerEvent];

      const result = getDispatchEventData(mockNode, event, activeEvents);

      expect(result).toEqual({
        event,
        pointersCount: 3,
        target: mockTarget,
        x: 50, // 60 - 10
        y: 50, // 70 - 20
        attachmentNode: mockNode,
      });
    });

    test('should handle single active event', () => {
      const mockNode = {
        getBoundingClientRect: mockGetBoundingClientRect,
      } as unknown as HTMLElement;

      mockGetBoundingClientRect.mockReturnValue({
        left: 0,
        top: 0,
        right: 100,
        bottom: 100,
      });

      const mockTarget = document.createElement('span');
      const event = {
        clientX: 25,
        clientY: 35,
        target: mockTarget,
      } as unknown as PointerEvent;

      const activeEvents = [event];

      const result = getDispatchEventData(mockNode, event, activeEvents);

      expect(result.pointersCount).toBe(1);
      expect(result.target).toBe(mockTarget);
    });

    test('should handle empty active events array', () => {
      const mockNode = {
        getBoundingClientRect: mockGetBoundingClientRect,
      } as unknown as HTMLElement;

      mockGetBoundingClientRect.mockReturnValue({
        left: 0,
        top: 0,
        right: 100,
        bottom: 100,
      });

      const event = {
        clientX: 25,
        clientY: 35,
        target: document.createElement('div'),
      } as unknown as PointerEvent;

      const activeEvents: PointerEvent[] = [];

      const result = getDispatchEventData(mockNode, event, activeEvents);

      expect(result.pointersCount).toBe(0);
    });
  });
});
