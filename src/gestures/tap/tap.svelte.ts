import {
	DEFAULT_DELAY,
	type SubGestureFunctions,
	type BaseParams,
	type GestureCustomEvent,
	type ActionType,
	createPointerControls
} from '../../shared';
import { createAttachmentKey } from 'svelte/attachments';

export type TapParameters = {
	timeframe: number;
} & BaseParams;

export type TapPointerEventDetail = {
	x: number;
	y: number;
	target: EventTarget | null;
	pointerType: string;
};

export type TapCustomEvent = CustomEvent<TapPointerEventDetail>;

const gestureName = 'tap' as const;

type OnEventType = `on${typeof gestureName}`;
type EventTypeName = `${OnEventType}${ActionType}`;
export type SapEvent = Record<OnEventType, (gestureEvent: TapCustomEvent) => void>;

export function useTap(
	handler: (e: TapCustomEvent) => void,
	inputParameters?: () => Partial<TapParameters>,
	baseHandlers?: Partial<Record<EventTypeName, (gestureEvent: GestureCustomEvent) => void>>
) {
	const { setPointerControls } = createPointerControls();

	return {
		...baseHandlers,
		[`on${gestureName}`]: handler,
		[createAttachmentKey()]: (node: HTMLElement) => {
			const { onDown, onUp, parameters } = tapBase(node, inputParameters?.());

			return setPointerControls(
				gestureName,
				node,
				null,
				onDown,
				onUp,
				parameters.touchAction,
				parameters.plugins
			).destroy;
		}
	};
}

export const tapComposition = (
	node: HTMLElement,
	inputParameters?: Partial<TapParameters>
): SubGestureFunctions => {
	const { onDown, onUp, parameters } = tapBase(node, inputParameters);
	return {
		onMove: null,
		onDown,
		onUp,
		plugins: parameters.plugins
	};
};

function tapBase(node: HTMLElement, inputParameters?: Partial<TapParameters>) {
	const parameters: TapParameters = {
		timeframe: DEFAULT_DELAY,
		composed: false,
		touchAction: 'auto',
		...inputParameters
	};

	let startTime: number;
	let clientX: number;
	let clientY: number;

	function onUp(activeEvents: PointerEvent[], event: PointerEvent) {
		if (
			Math.abs(event.clientX - clientX) < 4 &&
			Math.abs(event.clientY - clientY) < 4 &&
			Date.now() - startTime < parameters.timeframe
		) {
			const rect = node.getBoundingClientRect();
			const x = Math.round(event.clientX - rect.left);
			const y = Math.round(event.clientY - rect.top);

			node.dispatchEvent(
				new CustomEvent<TapPointerEventDetail>(gestureName, {
					detail: {
						x,
						y,
						target: event.target,
						pointerType: event.pointerType
					}
				})
			);
		}
	}

	function onDown(activeEvents: PointerEvent[], event: PointerEvent) {
		clientX = event.clientX;
		clientY = event.clientY;
		startTime = Date.now();
	}

	return { onDown, onUp, parameters };
}
