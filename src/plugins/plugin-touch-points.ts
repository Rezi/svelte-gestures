import type { DispatchEvent, GesturePlugin } from '../shared';

export type TouchPointsPluginFn = (options: {
  color?: string;
  zIndex?: number;
  size?: number;
}) => GesturePlugin;

export const touchPointsPlugin: TouchPointsPluginFn = (options) => {
  const fallbacks = {
    color: '#00ff00',
    zIndex: 1000000,
    size: 100,
  };

  let wrapper: HTMLDivElement | undefined = undefined;

  function onDestroy(): void {
    window.document.getElementById('svelte-gestures-touch-plugin')?.remove();
  }

  function rebuildWrapper(activeEvents: PointerEvent[]): void {
    // Reset if already running (could caused by some unexpected browser behavior)
    onDestroy();

    wrapper = window.document.createElement('div');
    wrapper.id = 'svelte-gestures-touch-plugin';

    activeEvents.forEach((event, i) => {
      const point = window.document.createElement('div');
      point.id = `svelte-gestures-touch-${i}`;
      point.style.cssText = `
position: absolute;
top: ${event.clientY - (options.size ?? fallbacks.size) / 2}px;
left: ${event.clientX - (options.size ?? fallbacks.size) / 2}px;
width: ${options.size ?? fallbacks.size}px;
height: ${options.size ?? fallbacks.size}px;
border-radius: 50%;
background-color: ${options.color ?? fallbacks.color};
`;
      wrapper?.appendChild(point);
    });

    wrapper.style.cssText = `
display: block; 
width: 100dvw;
height: 100dvh;
top: 0;
left: 0;
position: fixed;
pointer-events: none;
z-index: ${options.zIndex ?? fallbacks.zIndex};
`;
    window.document.body.appendChild(wrapper);
  }

  return {
    onMove: (
      dispatchEvent: DispatchEvent,
      activeEvents: PointerEvent[]
    ): void => {
      activeEvents.forEach((event, i) => {
        const point = window.document.getElementById(
          `svelte-gestures-touch-${i}`
        );
        if (point) {
          point.style.top = `${
            event.clientY - (options.size ?? fallbacks.size) / 2
          }px`;
          point.style.left = `${
            event.clientX - (options.size ?? fallbacks.size) / 2
          }px`;
        }
      });
    },
    onDown: (
      dispatchEvent: DispatchEvent,
      activeEvents: PointerEvent[]
    ): void => {
      rebuildWrapper(activeEvents);
    },
    onUp: (
      dispatchEvent: DispatchEvent,
      activeEvents: PointerEvent[]
    ): void => {
      if (activeEvents.length === 0) {
        onDestroy();
      } else {
        rebuildWrapper(activeEvents);
      }
    },
    onDestroy: onDestroy,
  };
};
