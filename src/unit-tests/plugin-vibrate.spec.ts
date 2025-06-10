import { describe, expect, test, beforeEach, afterEach, vi } from 'vitest';
import { vibratePlugin } from '../plugins/plugin-vibrate';
import type { DispatchEvent } from '../shared';

// Mock navigator.vibrate
const mockVibrate = vi.fn();

describe('vibratePlugin', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Setup navigator mock
    vi.stubGlobal('navigator', { vibrate: mockVibrate });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Plugin initialization', () => {
    test('should create plugin with default options', () => {
      const plugin = vibratePlugin();

      expect(plugin).toHaveProperty('onMove');
      expect(plugin).toHaveProperty('onDown');
      expect(plugin).toHaveProperty('onUp');
      expect(plugin).toHaveProperty('onDestroy');
    });

    test('should create plugin with custom vibration sequence', () => {
      const options = {
        vibrationSequence: [100, 50, 200],
      };

      const plugin = vibratePlugin(options);

      expect(plugin).toHaveProperty('onMove');
      expect(plugin).toHaveProperty('onDown');
      expect(plugin).toHaveProperty('onUp');
      expect(plugin).toHaveProperty('onDestroy');
    });

    test('should create plugin with undefined options', () => {
      const plugin = vibratePlugin(undefined);

      expect(plugin).toHaveProperty('onMove');
      expect(plugin).toHaveProperty('onDown');
      expect(plugin).toHaveProperty('onUp');
      expect(plugin).toHaveProperty('onDestroy');
    });
  });

  describe('Vibration functionality', () => {
    test('should trigger vibration on onDown with default sequence', () => {
      const plugin = vibratePlugin();
      const mockDispatchEvent: DispatchEvent = {
        event: {} as PointerEvent,
        pointersCount: 1,
        target: document.createElement('div'),
        x: 100,
        y: 100,
        attachementNode: document.createElement('div'),
      };
      const activeEvents: PointerEvent[] = [];

      plugin.onDown(mockDispatchEvent, activeEvents);

      expect(mockVibrate).toHaveBeenCalledWith([200]);
    });

    test('should trigger vibration on onDown with custom sequence', () => {
      const customSequence = [100, 50, 200, 50, 100];
      const plugin = vibratePlugin({ vibrationSequence: customSequence });
      const mockDispatchEvent: DispatchEvent = {
        event: {} as PointerEvent,
        pointersCount: 1,
        target: document.createElement('div'),
        x: 100,
        y: 100,
        attachementNode: document.createElement('div'),
      };
      const activeEvents: PointerEvent[] = [];

      plugin.onDown(mockDispatchEvent, activeEvents);

      expect(mockVibrate).toHaveBeenCalledWith(customSequence);
    });

    test('should not vibrate on onMove', () => {
      const plugin = vibratePlugin();
      const mockDispatchEvent: DispatchEvent = {
        event: {} as PointerEvent,
        pointersCount: 1,
        target: document.createElement('div'),
        x: 100,
        y: 100,
        attachementNode: document.createElement('div'),
      };
      const activeEvents: PointerEvent[] = [];

      plugin.onMove(mockDispatchEvent, activeEvents);

      expect(mockVibrate).not.toHaveBeenCalled();
    });

    test('should stop vibration when no active events on onUp', () => {
      const plugin = vibratePlugin();
      const mockDispatchEvent: DispatchEvent = {
        event: {} as PointerEvent,
        pointersCount: 1,
        target: document.createElement('div'),
        x: 100,
        y: 100,
        attachementNode: document.createElement('div'),
      };
      const activeEvents: PointerEvent[] = [];

      plugin.onUp(mockDispatchEvent, activeEvents);

      expect(mockVibrate).toHaveBeenCalledWith([]);
    });

    test('should not stop vibration when active events exist on onUp', () => {
      const plugin = vibratePlugin();
      const mockDispatchEvent: DispatchEvent = {
        event: {} as PointerEvent,
        pointersCount: 1,
        target: document.createElement('div'),
        x: 100,
        y: 100,
        attachementNode: document.createElement('div'),
      };
      const activeEvents = [{} as PointerEvent];

      vi.clearAllMocks();
      plugin.onUp(mockDispatchEvent, activeEvents);

      expect(mockVibrate).not.toHaveBeenCalled();
    });

    test('should stop vibration on onDestroy', () => {
      const plugin = vibratePlugin();

      plugin.onDestroy?.();

      expect(mockVibrate).toHaveBeenCalledWith([]);
    });
  });

  describe('Options handling', () => {
    test('should merge custom options with defaults', () => {
      const customOptions = { vibrationSequence: [300, 100, 300] };
      const plugin = vibratePlugin(customOptions);
      const mockDispatchEvent: DispatchEvent = {
        event: {} as PointerEvent,
        pointersCount: 1,
        target: document.createElement('div'),
        x: 100,
        y: 100,
        attachementNode: document.createElement('div'),
      };
      const activeEvents: PointerEvent[] = [];

      plugin.onDown(mockDispatchEvent, activeEvents);

      expect(mockVibrate).toHaveBeenCalledWith([300, 100, 300]);
    });

    test('should use default sequence when no options provided', () => {
      const plugin = vibratePlugin();
      const mockDispatchEvent: DispatchEvent = {
        event: {} as PointerEvent,
        pointersCount: 1,
        target: document.createElement('div'),
        x: 100,
        y: 100,
        attachementNode: document.createElement('div'),
      };
      const activeEvents: PointerEvent[] = [];

      plugin.onDown(mockDispatchEvent, activeEvents);

      expect(mockVibrate).toHaveBeenCalledWith([200]);
    });

    test('should handle empty vibration sequence', () => {
      const plugin = vibratePlugin({ vibrationSequence: [] });
      const mockDispatchEvent: DispatchEvent = {
        event: {} as PointerEvent,
        pointersCount: 1,
        target: document.createElement('div'),
        x: 100,
        y: 100,
        attachementNode: document.createElement('div'),
      };
      const activeEvents: PointerEvent[] = [];

      plugin.onDown(mockDispatchEvent, activeEvents);

      expect(mockVibrate).toHaveBeenCalledWith([]);
    });

    test('should handle single vibration value', () => {
      const plugin = vibratePlugin({ vibrationSequence: [500] });
      const mockDispatchEvent: DispatchEvent = {
        event: {} as PointerEvent,
        pointersCount: 1,
        target: document.createElement('div'),
        x: 100,
        y: 100,
        attachementNode: document.createElement('div'),
      };
      const activeEvents: PointerEvent[] = [];

      plugin.onDown(mockDispatchEvent, activeEvents);

      expect(mockVibrate).toHaveBeenCalledWith([500]);
    });
  });

  describe('Navigator vibrate availability', () => {
    test('should handle missing navigator.vibrate gracefully', () => {
      // Remove vibrate from navigator
      vi.stubGlobal('navigator', {
        value: undefined,
        writable: true,
      });

      const plugin = vibratePlugin();
      const mockDispatchEvent: DispatchEvent = {
        event: {} as PointerEvent,
        pointersCount: 1,
        target: document.createElement('div'),
        x: 100,
        y: 100,
        attachementNode: document.createElement('div'),
      };
      const activeEvents: PointerEvent[] = [];

      expect(() => {
        plugin.onDown(mockDispatchEvent, activeEvents);
      }).not.toThrow();
      vi.unstubAllGlobals();
    });

    test('should handle undefined navigator gracefully', () => {
      // Remove navigator entirely
      /*    Object.defineProperty(globalThis, 'navigator', {
        value: undefined,
        writable: true,
      });
 */
      vi.stubGlobal('navigator', {
        value: undefined,
        writable: true,
      });

      const plugin = vibratePlugin();
      const mockDispatchEvent: DispatchEvent = {
        event: {} as PointerEvent,
        pointersCount: 1,
        target: document.createElement('div'),
        x: 100,
        y: 100,
        attachementNode: document.createElement('div'),
      };
      const activeEvents: PointerEvent[] = [];

      expect(() => {
        plugin.onDown(mockDispatchEvent, activeEvents);
      }).not.toThrow();
      vi.unstubAllGlobals();
    });
  });

  describe('Plugin lifecycle', () => {
    test('should call onDestroy multiple times without error', () => {
      const plugin = vibratePlugin();

      expect(() => {
        plugin.onDestroy?.();
        plugin.onDestroy?.();
        plugin.onDestroy?.();
      }).not.toThrow();

      expect(mockVibrate).toHaveBeenCalledTimes(3);
      expect(mockVibrate).toHaveBeenCalledWith([]);
    });

    test('should handle rapid onDown calls', () => {
      const plugin = vibratePlugin({ vibrationSequence: [100] });
      const mockDispatchEvent: DispatchEvent = {
        event: {} as PointerEvent,
        pointersCount: 1,
        target: document.createElement('div'),
        x: 100,
        y: 100,
        attachementNode: document.createElement('div'),
      };
      const activeEvents: PointerEvent[] = [];

      plugin.onDown(mockDispatchEvent, activeEvents);
      plugin.onDown(mockDispatchEvent, activeEvents);
      plugin.onDown(mockDispatchEvent, activeEvents);

      expect(mockVibrate).toHaveBeenCalledTimes(3);
      expect(mockVibrate).toHaveBeenCalledWith([100]);
    });

    test('should handle mixed onDown and onDestroy calls', () => {
      const plugin = vibratePlugin({ vibrationSequence: [150] });
      const mockDispatchEvent: DispatchEvent = {
        event: {} as PointerEvent,
        pointersCount: 1,
        target: document.createElement('div'),
        x: 100,
        y: 100,
        attachementNode: document.createElement('div'),
      };
      const activeEvents: PointerEvent[] = [];

      plugin.onDown(mockDispatchEvent, activeEvents);
      plugin.onDestroy?.();
      plugin.onDown(mockDispatchEvent, activeEvents);
      plugin.onDestroy?.();

      expect(mockVibrate).toHaveBeenCalledTimes(4);
      expect(mockVibrate).toHaveBeenNthCalledWith(1, [150]);
      expect(mockVibrate).toHaveBeenNthCalledWith(2, []);
      expect(mockVibrate).toHaveBeenNthCalledWith(3, [150]);
      expect(mockVibrate).toHaveBeenNthCalledWith(4, []);
    });
  });

  describe('Complex vibration patterns', () => {
    test('should handle complex vibration patterns', () => {
      const complexPattern = [200, 100, 200, 100, 400, 100, 200];
      const plugin = vibratePlugin({ vibrationSequence: complexPattern });
      const mockDispatchEvent: DispatchEvent = {
        event: {} as PointerEvent,
        pointersCount: 1,
        target: document.createElement('div'),
        x: 100,
        y: 100,
        attachementNode: document.createElement('div'),
      };
      const activeEvents: PointerEvent[] = [];

      plugin.onDown(mockDispatchEvent, activeEvents);

      expect(mockVibrate).toHaveBeenCalledWith(complexPattern);
    });

    test('should handle very long vibration sequences', () => {
      const longPattern = Array(20)
        .fill(0)
        .map((_, i) => (i % 2 === 0 ? 100 : 50));
      const plugin = vibratePlugin({ vibrationSequence: longPattern });
      const mockDispatchEvent: DispatchEvent = {
        event: {} as PointerEvent,
        pointersCount: 1,
        target: document.createElement('div'),
        x: 100,
        y: 100,
        attachementNode: document.createElement('div'),
      };
      const activeEvents: PointerEvent[] = [];

      plugin.onDown(mockDispatchEvent, activeEvents);

      expect(mockVibrate).toHaveBeenCalledWith(longPattern);
    });
  });
});
