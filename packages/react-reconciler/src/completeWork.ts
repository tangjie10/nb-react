import {
	Container,
	Instance,
	appendInitialChild,
	createInstance,
	createTextInstance
} from 'hostConfig';
import { FiberNode } from './fiber';
import {
	FunctionComponent,
	HostComponent,
	HostRoot,
	HostText
} from './workTags';
import { NoFlags, Update } from './fiberFlags';
import { updateFiberProps } from 'react-dom/src/SyntheicEvent';

function markUpdate(fiber: FiberNode) {
	fiber.flags |= Update;
}

//递归中的归
export const completeWork = (wip: FiberNode) => {
	const newProps = wip.pendingProps;
	const current = wip.alternate;
	console.warn('---------------');
	switch (wip.tag) {
		case HostComponent:
			if (current !== null && wip.stateNode) {
				//updata
				//1. props 是否有变化 有变化打update标记 并且保存下来
				// FiberNode.updateQueue = [className,'aaa',title,'bbb']
				// style className onClick ....
				updateFiberProps(wip.stateNode, newProps);
			} else {
				//构建DOM
				const instance = createInstance(wip.type, newProps);
				//插入DOM中
				appendAllChildren(instance, wip);
				wip.stateNode = instance;
			}
			bubbleProperties(wip);
			return null;
		case HostText:
			if (current !== null && wip.stateNode) {
				//updata
				const oldText = current.memoizedProps.content;
				const newText = newProps.content;
				console.warn(oldText, newText);
				if (oldText !== newText) {
					markUpdate(wip);
				}
			} else {
				//构建DOM
				const instance = createTextInstance(newProps.content);
				//插入DOM中
				wip.stateNode = instance;
			}
			bubbleProperties(wip);
			return null;
		case HostRoot:
			bubbleProperties(wip);
			return null;
		case FunctionComponent:
			bubbleProperties(wip);
			return null;
		default:
			if (__DEV__) {
				console.warn('未处理的completeWork的情况', wip);
			}
	}
};

export function appendAllChildren(
	parent: Instance | Container,
	wip: FiberNode
) {
	let node = wip.child;
	while (node !== null) {
		if (node.tag === HostComponent || node.tag === HostText) {
			appendInitialChild(parent, node?.stateNode);
		} else if (node.child !== null) {
			node.child.return = node;
			node = node.child;
			continue;
		}

		if (node === wip) {
			return;
		}

		while (node.sibling === null) {
			if (node.return === null || node.return === wip) {
				return;
			}
			node = node?.return;
		}
		node.sibling.return = node.return;
		node = node?.sibling;
	}
}

function bubbleProperties(wip: FiberNode) {
	let subTreeFlags = NoFlags;
	let child = wip.child;

	while (child !== null) {
		subTreeFlags |= child.subTreeFlags;
		subTreeFlags |= child.flags;

		child.return = wip;
		child = child.sibling;
	}

	wip.subTreeFlags |= subTreeFlags;
}
