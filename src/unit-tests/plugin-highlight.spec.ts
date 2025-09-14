import { describe, expect, test, beforeEach, afterEach, vi } from 'vitest';
import { highlightPlugin } from '../plugins/plugin-highlight';
import type { DispatchEvent } from '../shared';

// Mock global objects and methods
const mockRequestAnimationFrame = vi.fn();
const mockCreateElement = vi.fn();
const mockGetElementById = vi.fn();
const mockAppendChild = vi.fn();
const mockRemove = vi.fn();
const mockAddEventListener = vi.fn();
const mockRemoveEventListener = vi.fn();
const mockGetContext = vi.fn();

// Mock canvas context methods
const mockBeginPath = vi.fn();
const mockMoveTo = vi.fn();
const mockLineTo = vi.fn();
const mockStroke = vi.fn();
const mockClearRect = vi.fn();
const mockDrawImage = vi.fn();

const mockCanvas = {
  getContext: mockGetContext,
  style: { cssText: '' },
  width: 1920,
  height: 1080,
  id: '',
};

const mockCanvasContext = {
  beginPath: mockBeginPath,
  moveTo: mockMoveTo,
  lineTo: mockLineTo,
  stroke: mockStroke,
  clearRect: mockClearRect,
  drawImage: mockDrawImage,
  lineWidth: 0,
  lineCap: '',
  strokeStyle: '',
  globalAlpha: 1,
  canvas: mockCanvas,
};

describe('highlightPlugin', () => {
  const originalCreateElement = document.createElement;
  const originalGetElementById = document.getElementById;
  const originalAppendChild = document.body.appendChild;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    document.createElement = mockCreateElement;
    document.getElementById = mockGetElementById;
    document.body.appendChild = mockAppendChild;

    vi.stubGlobal('addEventListener', mockAddEventListener);
    vi.stubGlobal('removeEventListener', mockRemoveEventListener);
    vi.stubGlobal('requestAnimationFrame', mockRequestAnimationFrame);
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    vi.stubGlobal('innerWidth', 1920);
    vi.stubGlobal('innerHeight', 1080);

    (globalThis as any).Date.now = vi.fn(() => 1000);

    // Setup canvas mock
    mockCreateElement.mockReturnValue(mockCanvas);
    mockGetContext.mockReturnValue(mockCanvasContext);
    mockGetElementById.mockReturnValue({ remove: mockRemove });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.createElement = originalCreateElement;
    document.getElementById = originalGetElementById;
    document.body.appendChild = originalAppendChild;

    vi.unstubAllGlobals();
  });

  describe('Plugin initialization', () => {
    test('should create plugin with default options', () => {
      const plugin = highlightPlugin({});

      expect(plugin).toHaveProperty('onMove');
      expect(plugin).toHaveProperty('onDown');
      expect(plugin).toHaveProperty('onUp');
      expect(plugin).toHaveProperty('onDestroy');
      expect(plugin).toHaveProperty('onInit');
    });

    test('should create plugin with custom options', () => {
      const options = {
        color: '#ff0000',
        fadeTime: 2000,
        zIndex: 999999,
        lineWidth: 8,
      };

      const plugin = highlightPlugin(options);

      expect(plugin).toHaveProperty('onMove');
      expect(plugin).toHaveProperty('onDown');
      expect(plugin).toHaveProperty('onUp');
      expect(plugin).toHaveProperty('onDestroy');
      expect(plugin).toHaveProperty('onInit');
    });
  });

  describe('Canvas setup', () => {
    test('should create and configure canvas on onDown', () => {
      const plugin = highlightPlugin({});
      const mockDispatchEvent: DispatchEvent = {
        event: { x: 100, y: 100 } as PointerEvent,
        pointersCount: 1,
        target: document.createElement('div'),
        x: 100,
        y: 100,
        attachmentNode: document.createElement('div'),
      };

      plugin.onDown(mockDispatchEvent, []);

      expect(mockCreateElement).toHaveBeenCalledWith('canvas');
      expect(mockCanvas.id).toBe('svelte-gestures-highlight-plugin');
      expect(mockGetContext).toHaveBeenCalledWith('2d');
      expect(mockAppendChild).toHaveBeenCalledWith(mockCanvas);
      expect(mockAddEventListener).toHaveBeenCalledWith(
        'resize',
        expect.any(Function)
      );
    });

    test('should create canvas with custom zIndex', () => {
      const mockDispatchEvent: DispatchEvent = {
        event: { x: 100, y: 100 } as PointerEvent,
        pointersCount: 1,
        target: document.createElement('div'),
        x: 100,
        y: 100,
        attachmentNode: document.createElement('div'),
      };
      mockCreateElement.mockClear();
      const plugin = highlightPlugin({ zIndex: 555555 });

      plugin.onDown(mockDispatchEvent, []);

      expect(mockCanvas.style.cssText).toContain('z-index: 555555');
    });

    test('should cleanup existing canvas before creating new one', () => {
      const mockDispatchEvent: DispatchEvent = {
        event: { x: 100, y: 100 } as PointerEvent,
        pointersCount: 1,
        target: document.createElement('div'),
        x: 100,
        y: 100,
        attachmentNode: document.createElement('div'),
      };
      mockCreateElement.mockClear();
      const plugin = highlightPlugin({});

      plugin.onDown(mockDispatchEvent, []);
      plugin.onDown(mockDispatchEvent, []);

      expect(mockGetElementById).toHaveBeenCalledWith(
        'svelte-gestures-highlight-plugin'
      );
      expect(mockRemove).toHaveBeenCalled();
    });
  });

  describe('Drawing functionality', () => {
    test('should draw line on onMove', () => {
      const mockDispatchEvent: DispatchEvent = {
        event: { x: 100, y: 100 } as PointerEvent,
        pointersCount: 1,
        target: document.createElement('div'),
        x: 100,
        y: 100,
        attachmentNode: document.createElement('div'),
      };
      mockCreateElement.mockClear();
      const plugin = highlightPlugin({ color: '#ff0000', lineWidth: 6 });

      // Initialize canvas first
      plugin.onDown(mockDispatchEvent, []);

      // Clear mocks after initialization
      vi.clearAllMocks();

      // Test drawing
      const moveEvent: DispatchEvent = {
        event: { x: 150, y: 150 } as PointerEvent,
        pointersCount: 1,
        target: document.createElement('div'),
        x: 150,
        y: 150,
        attachmentNode: document.createElement('div'),
      };

      plugin.onMove(moveEvent, []);

      expect(mockBeginPath).toHaveBeenCalled();
      expect(mockCanvasContext.lineWidth).toBe(6);
      expect(mockCanvasContext.lineCap).toBe('round');
      expect(mockCanvasContext.strokeStyle).toBe('#ff0000');
      expect(mockStroke).toHaveBeenCalled();
    });

    test('should handle first move without previous position', () => {
      const mockDispatchEvent: DispatchEvent = {
        event: { x: 100, y: 100 } as PointerEvent,
        pointersCount: 1,
        target: document.createElement('div'),
        x: 100,
        y: 100,
        attachmentNode: document.createElement('div'),
      };
      mockCreateElement.mockClear();
      const plugin = highlightPlugin({});

      plugin.onDown(mockDispatchEvent, []);
      plugin.onMove(mockDispatchEvent, []);

      expect(mockBeginPath).toHaveBeenCalled();
      expect(mockStroke).toHaveBeenCalled();
      expect(mockMoveTo).toHaveBeenCalled();
      expect(mockLineTo).toHaveBeenCalled();
    });
  });

  describe('Cleanup functionality', () => {
    test('should cleanup on onDestroy', () => {
      const plugin = highlightPlugin({});

      plugin.onDestroy?.();

      expect(mockGetElementById).toHaveBeenCalledWith(
        'svelte-gestures-highlight-plugin'
      );
      expect(mockRemove).toHaveBeenCalled();
      expect(mockRemoveEventListener).toHaveBeenCalledWith(
        'resize',
        expect.any(Function)
      );
    });

    test('should cleanup when no active events on onUp', () => {
      const mockDispatchEvent: DispatchEvent = {
        event: { x: 100, y: 100 } as PointerEvent,
        pointersCount: 1,
        target: document.createElement('div'),
        x: 100,
        y: 100,
        attachmentNode: document.createElement('div'),
      };
      mockCreateElement.mockClear();
      const plugin = highlightPlugin({});

      plugin.onUp(mockDispatchEvent, []);

      expect(mockGetElementById).toHaveBeenCalledWith(
        'svelte-gestures-highlight-plugin'
      );
      expect(mockRemove).toHaveBeenCalled();
    });

    test('should not cleanup when active events exist on onUp', () => {
      const mockDispatchEvent: DispatchEvent = {
        event: { x: 100, y: 100 } as PointerEvent,
        pointersCount: 1,
        target: document.createElement('div'),
        x: 100,
        y: 100,
        attachmentNode: document.createElement('div'),
      };
      mockCreateElement.mockClear();
      const plugin = highlightPlugin({});

      const activeEvents = [{ x: 100, y: 100 } as PointerEvent];

      vi.clearAllMocks();
      plugin.onUp(mockDispatchEvent, activeEvents);

      expect(mockGetElementById).not.toHaveBeenCalled();
      expect(mockRemove).not.toHaveBeenCalled();
    });
  });

  describe('onInit functionality', () => {
    test('should initialize when active events exist', () => {
      const plugin = highlightPlugin({});
      const activeEvents = [{ x: 100, y: 100 } as PointerEvent];

      plugin.onInit?.(activeEvents);

      expect(mockCreateElement).toHaveBeenCalledWith('canvas');
      expect(mockAppendChild).toHaveBeenCalledWith(mockCanvas);
    });

    test('should not initialize when no active events', () => {
      const plugin = highlightPlugin({});
      const activeEvents: PointerEvent[] = [];

      plugin.onInit?.(activeEvents);

      expect(mockCreateElement).not.toHaveBeenCalled();
      expect(mockAppendChild).not.toHaveBeenCalled();
    });
  });

  describe('Default values', () => {
    test('should use default values when options are not provided', () => {
      const mockDispatchEvent: DispatchEvent = {
        event: { x: 100, y: 100 } as PointerEvent,
        pointersCount: 1,
        target: document.createElement('div'),
        x: 100,
        y: 100,
        attachmentNode: document.createElement('div'),
      };
      mockCreateElement.mockClear();
      const plugin = highlightPlugin({});

      plugin.onDown(mockDispatchEvent, []);
      plugin.onMove(mockDispatchEvent, []);

      expect(mockCanvas.style.cssText).toContain('z-index: 1000000');
      expect(mockCanvasContext.lineWidth).toBe(4);
      expect(mockCanvasContext.strokeStyle).toBe('#00ff00');
    });
  });
});
