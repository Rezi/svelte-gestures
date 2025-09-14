import { describe, expect, test, beforeEach, afterEach, vi } from 'vitest';
import { touchPointsPlugin } from '../plugins/plugin-touch-points';
import type { DispatchEvent } from '../shared';

// Mock DOM methods
const mockCreateElement = vi.fn();
const mockGetElementById = vi.fn();
const mockAppendChild = vi.fn();
const mockRemove = vi.fn();

const mockDiv = {
  style: { cssText: '' },
  id: '',
  appendChild: mockAppendChild,
};

const mockPoint = {
  style: {
    cssText: '',
    top: '',
    left: '',
  },
  id: '',
};

describe('touchPointsPlugin', () => {
  const originalCreateElement = document.createElement;
  const originalGetElementById = document.getElementById;
  const originalAppendChild = document.body.appendChild;
  beforeEach(() => {
    vi.clearAllMocks();

    document.createElement = mockCreateElement;
    document.getElementById = mockGetElementById;
    document.body.appendChild = mockAppendChild;

    // Setup DOM element mocks
    // The styles: need to be set for each element, otherwise they will be shared via reference of the mock
    mockCreateElement.mockImplementation((tag: string) => {
      if (tag === 'div') {
        return {
          style: { cssText: '' },
          id: '',
          appendChild: mockAppendChild,
        };
      }
      return {
        style: {
          cssText: '',
          top: '',
          left: '',
        },
        id: '',
      };
    });

    mockGetElementById.mockImplementation((id: string) => {
      if (id === 'svelte-gestures-touch-plugin') {
        return { remove: mockRemove };
      }
      if (id.startsWith('svelte-gestures-touch-')) {
        return { ...mockPoint };
      }
      return null;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.createElement = originalCreateElement;
    document.getElementById = originalGetElementById;
    document.body.appendChild = originalAppendChild;
  });

  describe('Plugin initialization', () => {
    test('should create plugin with default options', () => {
      const plugin = touchPointsPlugin({});

      expect(plugin).toHaveProperty('onMove');
      expect(plugin).toHaveProperty('onDown');
      expect(plugin).toHaveProperty('onUp');
      expect(plugin).toHaveProperty('onDestroy');
    });

    test('should create plugin with custom options', () => {
      const options = {
        color: '#ff0000',
        zIndex: 999999,
        size: 150,
      };

      const plugin = touchPointsPlugin(options);

      expect(plugin).toHaveProperty('onMove');
      expect(plugin).toHaveProperty('onDown');
      expect(plugin).toHaveProperty('onUp');
      expect(plugin).toHaveProperty('onDestroy');
    });
  });

  describe('Touch point creation', () => {
    test('should create wrapper and touch points on onDown', () => {
      const mockDispatchEvent: DispatchEvent = {
        event: { clientX: 100, clientY: 100 } as PointerEvent,
        pointersCount: 1,
        target: document.createElement('div'),
        x: 100,
        y: 100,
        attachmentNode: document.createElement('div'),
      };
      mockCreateElement.mockClear();
      const plugin = touchPointsPlugin({});
      const activeEvents = [{ clientX: 100, clientY: 100 } as PointerEvent];

      plugin.onDown(mockDispatchEvent, activeEvents);

      expect(mockCreateElement).toHaveBeenCalledWith('div');
      expect(mockAppendChild).toHaveBeenCalled();
    });

    test('should create multiple touch points for multiple events', () => {
      const mockDispatchEvent: DispatchEvent = {
        event: { clientX: 100, clientY: 100 } as PointerEvent,
        pointersCount: 2,
        target: document.createElement('div'),
        x: 100,
        y: 100,
        attachmentNode: document.createElement('div'),
      };

      mockCreateElement.mockClear();

      const plugin = touchPointsPlugin({});

      const activeEvents = [
        { clientX: 100, clientY: 100 } as PointerEvent,
        { clientX: 200, clientY: 200 } as PointerEvent,
      ];

      plugin.onDown(mockDispatchEvent, activeEvents);

      // Should create wrapper + 2 touch points = 3 div elements
      expect(mockCreateElement).toHaveBeenCalledTimes(3);
      expect(mockCreateElement).toHaveBeenCalledWith('div');
    });

    test('should apply custom styling options', () => {
      const mockDispatchEvent: DispatchEvent = {
        event: { clientX: 100, clientY: 100 } as PointerEvent,
        pointersCount: 1,
        target: document.createElement('div'),
        x: 100,
        y: 100,
        attachmentNode: document.createElement('div'),
      };
      mockCreateElement.mockClear();
      const options = {
        color: '#ff0000',
        zIndex: 555555,
        size: 80,
      };
      const plugin = touchPointsPlugin(options);

      const activeEvents = [{ clientX: 100, clientY: 100 } as PointerEvent];

      plugin.onDown(mockDispatchEvent, activeEvents);

      // Check if wrapper has correct z-index
      const wrapperCall = mockCreateElement.mock.results[0];
      expect(wrapperCall.value.style.cssText).toContain('z-index: 555555');
    });

    test('should position touch points correctly', () => {
      const mockDispatchEvent: DispatchEvent = {
        event: { clientX: 150, clientY: 200 } as PointerEvent,
        pointersCount: 1,
        target: document.createElement('div'),
        x: 150,
        y: 200,
        attachmentNode: document.createElement('div'),
      };
      mockCreateElement.mockClear();
      const plugin = touchPointsPlugin({ size: 100 });

      const activeEvents = [{ clientX: 150, clientY: 200 } as PointerEvent];

      plugin.onDown(mockDispatchEvent, activeEvents);

      // Touch point should be positioned at clientX/Y - size/2
      const pointCall = mockCreateElement.mock.results[1];
      expect(pointCall.value.style.cssText).toContain('top: 150px'); // 200 - 100/2
      expect(pointCall.value.style.cssText).toContain('left: 100px'); // 150 - 100/2
    });
  });

  describe('Touch point movement', () => {
    test('should update touch point positions on onMove', () => {
      const mockDispatchEvent: DispatchEvent = {
        event: { clientX: 100, clientY: 100 } as PointerEvent,
        pointersCount: 1,
        target: document.createElement('div'),
        x: 100,
        y: 100,
        attachmentNode: document.createElement('div'),
      };

      mockCreateElement.mockClear();
      const plugin = touchPointsPlugin({ size: 100 });
      const activeEvents = [{ clientX: 100, clientY: 100 } as PointerEvent];

      // First create the touch points
      plugin.onDown(mockDispatchEvent, activeEvents);

      // Clear mocks to test move
      vi.clearAllMocks();

      // Now test movement
      const moveEvents = [{ clientX: 150, clientY: 200 } as PointerEvent];

      const mockPoint = { style: { top: '', left: '' } };
      mockGetElementById.mockReturnValue(mockPoint);

      plugin.onMove(mockDispatchEvent, moveEvents);

      expect(mockGetElementById).toHaveBeenCalledWith(
        'svelte-gestures-touch-0'
      );
      expect(mockPoint.style.top).toBe('150px'); // 200 - 100/2
      expect(mockPoint.style.left).toBe('100px'); // 150 - 100/2
    });

    test('should update multiple touch points on onMove', () => {
      const mockDispatchEvent: DispatchEvent = {
        event: { clientX: 100, clientY: 100 } as PointerEvent,
        pointersCount: 2,
        target: document.createElement('div'),
        x: 100,
        y: 100,
        attachmentNode: document.createElement('div'),
      };
      mockCreateElement.mockClear();

      const plugin = touchPointsPlugin({ size: 50 });

      const moveEvents = [
        { clientX: 100, clientY: 100 } as PointerEvent,
        { clientX: 200, clientY: 200 } as PointerEvent,
      ];

      const mockPoint1 = { style: { top: '', left: '' } };
      const mockPoint2 = { style: { top: '', left: '' } };

      mockGetElementById.mockImplementation((id: string) => {
        if (id === 'svelte-gestures-touch-0') return mockPoint1;
        if (id === 'svelte-gestures-touch-1') return mockPoint2;
        return null;
      });

      plugin.onMove(mockDispatchEvent, moveEvents);

      expect(mockGetElementById).toHaveBeenCalledWith(
        'svelte-gestures-touch-0'
      );
      expect(mockGetElementById).toHaveBeenCalledWith(
        'svelte-gestures-touch-1'
      );
      expect(mockPoint1.style.top).toBe('75px'); // 100 - 50/2
      expect(mockPoint1.style.left).toBe('75px'); // 100 - 50/2
      expect(mockPoint2.style.top).toBe('175px'); // 200 - 50/2
      expect(mockPoint2.style.left).toBe('175px'); // 200 - 50/2
    });

    test('should handle missing touch point elements gracefully', () => {
      const plugin = touchPointsPlugin({});
      const mockDispatchEvent: DispatchEvent = {
        event: { clientX: 100, clientY: 100 } as PointerEvent,
        pointersCount: 1,
        target: document.createElement('div'),
        x: 100,
        y: 100,
        attachmentNode: document.createElement('div'),
      };
      const activeEvents = [{ clientX: 100, clientY: 100 } as PointerEvent];

      mockGetElementById.mockReturnValue(null);

      expect(() => {
        plugin.onMove(mockDispatchEvent, activeEvents);
      }).not.toThrow();
    });
  });

  describe('Cleanup functionality', () => {
    test('should cleanup on onDestroy', () => {
      const plugin = touchPointsPlugin({});

      plugin?.onDestroy?.();

      expect(mockGetElementById).toHaveBeenCalledWith(
        'svelte-gestures-touch-plugin'
      );
      expect(mockRemove).toHaveBeenCalled();
    });

    test('should cleanup when no active events on onUp', () => {
      const plugin = touchPointsPlugin({});
      const mockDispatchEvent: DispatchEvent = {
        event: { clientX: 100, clientY: 100 } as PointerEvent,
        pointersCount: 1,
        target: document.createElement('div'),
        x: 100,
        y: 100,
        attachmentNode: document.createElement('div'),
      };

      plugin.onUp(mockDispatchEvent, []);

      expect(mockGetElementById).toHaveBeenCalledWith(
        'svelte-gestures-touch-plugin'
      );
      expect(mockRemove).toHaveBeenCalled();
    });

    test('should rebuild wrapper when active events exist on onUp', () => {
      const mockDispatchEvent: DispatchEvent = {
        event: { clientX: 100, clientY: 100 } as PointerEvent,
        pointersCount: 1,
        target: document.createElement('div'),
        x: 100,
        y: 100,
        attachmentNode: document.createElement('div'),
      };
      mockCreateElement.mockClear();
      const plugin = touchPointsPlugin({});
      const activeEvents = [{ clientX: 150, clientY: 200 } as PointerEvent];

      plugin.onUp(mockDispatchEvent, activeEvents);

      // Should cleanup first, then rebuild
      expect(mockGetElementById).toHaveBeenCalledWith(
        'svelte-gestures-touch-plugin'
      );
      expect(mockRemove).toHaveBeenCalled();
      expect(mockCreateElement).toHaveBeenCalledWith('div');
      expect(mockAppendChild).toHaveBeenCalled();
    });
  });

  describe('Default values', () => {
    test('should use default values when options are not provided', () => {
      const mockDispatchEvent: DispatchEvent = {
        event: { clientX: 100, clientY: 100 } as PointerEvent,
        pointersCount: 1,
        target: document.createElement('div'),
        x: 100,
        y: 100,
        attachmentNode: document.createElement('div'),
      };
      mockCreateElement.mockClear();
      const plugin = touchPointsPlugin({});

      const activeEvents = [{ clientX: 100, clientY: 100 } as PointerEvent];

      plugin.onDown(mockDispatchEvent, activeEvents);

      // Check wrapper defaults
      const wrapperCall = mockCreateElement.mock.results[0];
      expect(wrapperCall.value.style.cssText).toContain('z-index: 1000000');

      // Check point defaults
      const pointCall = mockCreateElement.mock.results[1];
      expect(pointCall.value.style.cssText).toContain('width: 100px');
      expect(pointCall.value.style.cssText).toContain('height: 100px');
      expect(pointCall.value.style.cssText).toContain(
        'background-color: #00ff00'
      );
    });
  });

  describe('Wrapper cleanup and rebuild', () => {
    test('should cleanup existing wrapper before creating new one', () => {
      const plugin = touchPointsPlugin({});
      const mockDispatchEvent: DispatchEvent = {
        event: { clientX: 100, clientY: 100 } as PointerEvent,
        pointersCount: 1,
        target: document.createElement('div'),
        x: 100,
        y: 100,
        attachmentNode: document.createElement('div'),
      };
      const activeEvents = [{ clientX: 100, clientY: 100 } as PointerEvent];

      // Call onDown twice to test cleanup
      plugin.onDown(mockDispatchEvent, activeEvents);
      plugin.onDown(mockDispatchEvent, activeEvents);

      // Should cleanup before creating new wrapper
      expect(mockGetElementById).toHaveBeenCalledWith(
        'svelte-gestures-touch-plugin'
      );
      expect(mockRemove).toHaveBeenCalled();
    });
  });
});
