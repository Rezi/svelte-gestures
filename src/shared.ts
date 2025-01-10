export const DEFAULT_DELAY = 300; // ms
export const DEFAULT_PRESS_SPREAD = 4; // px
export const DEFAULT_MIN_SWIPE_DISTANCE = 60; // px
export const DEFAULT_TOUCH_ACTION = 'none';

export type TouchAction =
	| 'auto'
	| 'none'
	| 'pan-x'
	| 'pan-left'
	| 'pan-right'
	| 'pan-y'
	| 'pan-up'
	| 'pan-down'
	| 'pinch-zoom'
	| 'manipulation'
	| 'inherit'
	| 'initial'
	| 'revert'
	| 'revert-layer'
	| 'unset';
// export type PointerType = 'mouse' | 'touch' | 'pen' | 'all';

export interface ActionReturn<
	Parameter = undefined,
	Attributes extends Record<string, unknown> = Record<never, unknown>
> {
	update?: (parameter: Parameter) => void;
	destroy?: () => void;
	/**
	 * ### DO NOT USE THIS
	 * This exists solely for type-checking and has no effect at runtime.
	 * Set this through the `Attributes` generic instead.
	 */
	$$_attributes?: Attributes;
}

export interface Action<
	Element = HTMLElement,
	Parameter = undefined,
	Attributes extends Record<string, unknown> = Record<never, unknown>
> {
	<Node extends Element>(
		...args: undefined extends Parameter
			? [node: Node, parameter?: Parameter]
			: [node: Node, parameter: Parameter]
	): void | ActionReturn<Parameter, Attributes>;
}

export type Coord = { x: number; y: number };
export type Composed = { composed: boolean };

export type BaseParams = Composed & {
	touchAction: TouchAction | TouchAction[];
	plugins?: GesturePlugin[] | undefined;
};

type ActionType = 'up' | 'down' | 'move';

//export type SvelteAction = () => void;

export type DispatchEvent = {
	event: PointerEvent;
	pointersCount: number;
	target: HTMLElement;
	x: number;
	y: number;
};

export type GestureCustomEvent = CustomEvent<DispatchEvent>;

export type PointerEventCallback<T> =
	| ((activeEvents: PointerEvent[], event: PointerEvent) => T)
	| null;

export type PluginEventCallback = (event: DispatchEvent, activeEvents: PointerEvent[]) => void;

export type SubGestureFunctions = {
	onMove: PointerEventCallback<boolean>;
	onUp: PointerEventCallback<void>;
	onDown: PointerEventCallback<void>;
	plugins: GesturePlugin[] | undefined;
};

export type GesturePlugin = {
	onMove: PluginEventCallback;
	onDown: PluginEventCallback;
	onUp: PluginEventCallback;
};

function ensureArray<T>(o: T | T[]): T[] {
	if (Array.isArray(o)) return o;
	return [o];
}

function addEventListener<ET extends EventTarget, E extends Event>(
	node: ET,
	event: string,
	handler: (this: ET, evt: E) => void
): () => void {
	node.addEventListener(event, handler as (evt: Event) => void);
	return () => node.removeEventListener(event, handler as (evt: Event) => void);
}

export function getCenterOfTwoPoints(node: HTMLElement, activeEvents: PointerEvent[]): Coord {
	const rect = node.getBoundingClientRect();
	const xDistance = Math.abs(activeEvents[0].clientX - activeEvents[1].clientX);
	const yDistance = Math.abs(activeEvents[0].clientY - activeEvents[1].clientY);
	const minX = Math.min(activeEvents[0].clientX, activeEvents[1].clientX);
	const minY = Math.min(activeEvents[0].clientY, activeEvents[1].clientY);
	const centerX = minX + xDistance / 2;
	const centerY = minY + yDistance / 2;

	const x = Math.round(centerX - rect.left);
	const y = Math.round(centerY - rect.top);

	return { x, y };
}

function removeEvent(event: PointerEvent, activeEvents: PointerEvent[]): PointerEvent[] {
	return activeEvents.filter((activeEvent: PointerEvent) => {
		return event.pointerId !== activeEvent.pointerId;
	});
}

export function callPlugins(
	plugins: GesturePlugin[] | undefined,
	event: PointerEvent,
	activeEvents: PointerEvent[],
	node: HTMLElement
) {
	plugins?.forEach((plugin: GesturePlugin) => {
		const eventData = getDispatchEventData(node, event, activeEvents);
		plugin['onMove']?.(eventData, activeEvents);
	});
}

export function getDispatchEventData(
	node: HTMLElement,
	event: PointerEvent,
	activeEvents: PointerEvent[]
): DispatchEvent {
	const rect = node.getBoundingClientRect();
	const x = Math.round(event.clientX - rect.left);
	const y = Math.round(event.clientY - rect.top);

	const eventData: DispatchEvent = {
		event,
		pointersCount: activeEvents.length,
		target: event.target as HTMLElement,
		x,
		y
	};
	return eventData;
}

function dispatch(
	node: HTMLElement,
	gestureName: string,
	event: PointerEvent,
	activeEvents: PointerEvent[],
	actionType: ActionType
): DispatchEvent {
	const eventData = getDispatchEventData(node, event, activeEvents);

	node.dispatchEvent(new CustomEvent(`${gestureName}${actionType}`, { detail: eventData }));

	return eventData;
}

export function setPointerControls(
	gestureName: string,
	node: HTMLElement,
	onMoveCallback: PointerEventCallback<boolean>,
	onDownCallback: PointerEventCallback<void>,
	onUpCallback: PointerEventCallback<void>,
	touchAction: TouchAction | TouchAction[] = DEFAULT_TOUCH_ACTION,
	plugins: GesturePlugin[] = []
): {
	destroy: () => void;
} {
	node.style.touchAction = ensureArray(touchAction).join(' ');
	let activeEvents: PointerEvent[] = [];

	function handlePointerdown(event: PointerEvent) {
		activeEvents.push(event);
		const dispatchEvent: DispatchEvent = dispatch(node, gestureName, event, activeEvents, 'down');
		onDownCallback?.(activeEvents, event);
		plugins.forEach((plugin) => {
			plugin.onDown?.(dispatchEvent, activeEvents);
		});
		const pointerId = event.pointerId;

		function onup(e: PointerEvent) {
			if (pointerId === e.pointerId) {
				activeEvents = removeEvent(e, activeEvents);

				if (!activeEvents.length) {
					removeEventHandlers();
				}

				const dispatchEvent: DispatchEvent = dispatch(node, gestureName, e, activeEvents, 'up');
				onUpCallback?.(activeEvents, e);
				plugins.forEach((plugin) => {
					plugin.onUp?.(dispatchEvent, activeEvents);
				});
			}
		}
		function removeEventHandlers() {
			removePointermoveHandler();
			removeLostpointercaptureHandler();
			removePointerUpHandler();
			removePointerLeaveHandler();
		}

		const removePointermoveHandler = addEventListener(node, 'pointermove', (e: PointerEvent) => {
			activeEvents = activeEvents.map((activeEvent: PointerEvent) => {
				return e.pointerId === activeEvent.pointerId ? e : activeEvent;
			});
			const dispatchEvent: DispatchEvent = dispatch(node, gestureName, e, activeEvents, 'move');
			onMoveCallback?.(activeEvents, e);
			plugins.forEach((plugin) => {
				plugin.onMove?.(dispatchEvent, activeEvents);
			});
		});

		const removeLostpointercaptureHandler = addEventListener(
			node,
			'lostpointercapture',
			(e: PointerEvent) => {
				onup(e);
			}
		);

		const removePointerUpHandler = addEventListener(node, 'pointerup', (e: PointerEvent) => {
			onup(e);
		});
		const removePointerLeaveHandler = addEventListener(node, 'pointerleave', (e: PointerEvent) => {
			activeEvents = [];
			removeEventHandlers();
			const dispatchEvent: DispatchEvent = dispatch(node, gestureName, e, activeEvents, 'up');
			onUpCallback?.(activeEvents, e);
			plugins.forEach((plugin) => {
				plugin.onUp?.(dispatchEvent, activeEvents);
			});
		});
	}

	const removePointerdownHandler = addEventListener(node, 'pointerdown', handlePointerdown);

	return {
		destroy: () => {
			removePointerdownHandler();
		}
	};
}
