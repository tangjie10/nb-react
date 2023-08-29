import { FiberNode } from 'react-reconciler/src/fiber';
import { HostText } from 'react-reconciler/src/workTags';
import { updateFiberProps } from './SyntheicEvent';
import { DOMElement } from './SyntheicEvent';

export type Container = Element;
export type Instance = Element;
export type TextInstance = Text;

export function createInstance(type: string, props: any): Instance {
	console.log(props);
	const element = document.createElement(type) as unknown;
	updateFiberProps(element as DOMElement, props);
	return element as DOMElement;
}

export function appendInitialChild(
	parent: Instance | Container,
	child: Instance
) {
	console.log(parent, child);
	parent.appendChild(child);
}

export function createTextInstance(content: string) {
	return document.createTextNode(content);
}

export const appendChildToContainer = appendInitialChild;

export function commitUpdate(fiber: FiberNode) {
	if (__DEV__) {
		console.warn('执行update操作', fiber);
	}
	switch (fiber.tag) {
		case HostText:
			const text = fiber.memoizedProps.content;
			return commitTextUpdate(fiber.stateNode, text);
		default:
			if (__DEV__) {
				console.warn('未实现的Update类型', fiber);
			}
			break;
	}
}

export function commitTextUpdate(textInstance: TextInstance, content: string) {
	textInstance.textContent = content;
}

export function removeChild(
	child: Instance | TextInstance,
	container: Container
) {
	container.removeChild(child);
}

export function insertChildToContainer(
	container: Container,
	child: Instance,
	before: Instance
) {
	container.insertBefore(child, before);
}
