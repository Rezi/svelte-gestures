import { type DispatchEvent, type GesturePlugin } from '../shared';

export type VibratePluginFn = (options?: {
  vibrationSequence: number[];
}) => GesturePlugin;

export const vibratePlugin: VibratePluginFn = (options) => {
  const fallbacks = {
    vibrationSequence: [200], // Default vibration duration in milliseconds
  };

  options = { ...fallbacks, ...options };

  function onDestroy() {
    navigator?.vibrate?.([]);
  }

  return {
    onMove: () => {},
    onDown: () => {
      navigator?.vibrate?.(options.vibrationSequence);
    },
    onUp: (dispatchEvent: DispatchEvent, activeEvents: PointerEvent[]) => {
      if (activeEvents.length === 0) {
        onDestroy();
      }
    },
    onDestroy: onDestroy,
  };
};
