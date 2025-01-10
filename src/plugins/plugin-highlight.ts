import type { DispatchEvent, GesturePlugin } from '../shared';

export type HighlightPluginFn = (options: {
  color?: string;
  fadeTime?: number;
  zIndex?: number;
  lineWidth?: number;
}) => GesturePlugin;

export const highlightPlugin: HighlightPluginFn = (options) => {
  const fallbacks = {
    color: '#00ff00',
    fadeTime: 1000,
    zIndex: 1000000,
    lineWidth: 4,
  };

  let canvas: HTMLCanvasElement | undefined = undefined;
  let ctx: CanvasRenderingContext2D | null = null;
  let offScreenCanvas: HTMLCanvasElement | undefined = undefined;
  let offScreenCtx: CanvasRenderingContext2D | null;
  let fadingRunning = false;
  let animationStepTime = Date.now();

  const pos = { x: 0, y: 0 };

  function animate() {
    const fadeTime = options.fadeTime ?? fallbacks.fadeTime;
    const now = Date.now();
    const deltaTime = now - animationStepTime;

    if (deltaTime > fadeTime / 20) {
      if (ctx && offScreenCanvas && offScreenCtx && canvas) {
        offScreenCtx.drawImage(canvas, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1 - (deltaTime * 3) / fadeTime;
        ctx.drawImage(offScreenCanvas, 0, 0);
        ctx.globalAlpha = 1;
        offScreenCtx.clearRect(0, 0, canvas.width, canvas.height);
      }
      animationStepTime = now;
    }

    if (fadingRunning) requestAnimationFrame(animate);
  }

  function setPosition(e: { x: number; y: number }) {
    pos.x = e.x;
    pos.y = e.y;
  }

  function resize() {
    if (ctx && offScreenCanvas && canvas) {
      ctx.canvas.width = window.innerWidth;
      ctx.canvas.height = window.innerHeight;

      offScreenCanvas.width = canvas.width;
      offScreenCanvas.height = canvas.height;
    }
  }

  function draw(e: { x: number; y: number }) {
    if (ctx) {
      ctx.beginPath();
      ctx.lineWidth = options.lineWidth ?? fallbacks.lineWidth;
      ctx.lineCap = 'round';
      ctx.strokeStyle = options.color ?? fallbacks.color;
      ctx.moveTo(pos.x, pos.y);
      setPosition(e);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
  }

  function onDestroy() {
    fadingRunning = false;
    window.document
      .getElementById('svelte-gestures-highlight-plugin')
      ?.remove();
    window.removeEventListener('resize', resize);
  }

  return {
    onMove: (dispatchEvent: DispatchEvent) => {
      draw(dispatchEvent.event);
    },
    onDown: (dispatchEvent: DispatchEvent) => {
      // Reset if already running (could caused by some unexpected browser behavior)
      onDestroy();

      canvas = window.document.createElement('canvas');
      canvas.id = 'svelte-gestures-highlight-plugin';
      ctx = canvas.getContext('2d');

      canvas.style.cssText = `
display: block; 
width: 100dvw;
height: 100dvh;
top: 0;
left: 0;
position: fixed;
pointer-events: none;
z-index: ${options.zIndex ?? fallbacks.zIndex};
`;
      window.document.body.appendChild(canvas);
      window.addEventListener('resize', resize);

      setPosition(dispatchEvent.event);

      // Create an off-screen canvas
      offScreenCanvas = document.createElement('canvas');

      resize();
      offScreenCtx = offScreenCanvas.getContext('2d');
      fadingRunning = true;
      animate();
    },
    onUp: onDestroy,
  };
};
