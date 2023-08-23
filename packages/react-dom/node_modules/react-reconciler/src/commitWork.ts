import { Container, appendChildToContainer } from 'hostConfig';
import { FiberNode } from './fiber';
import { MutationMask, NoFlags, Placement } from './fiberFlags';
import { HostComponent, HostRoot, HostText } from './workTags';
let nextEffect: FiberNode | null = null;
export const commitMutationEffects = (finishedWork: FiberNode) => {
	nextEffect = finishedWork;

	while (nextEffect !== null) {
		const child: FiberNode | null = nextEffect.child;
		if (
			(nextEffect.subTreeFlags & MutationMask) !== NoFlags &&
			child !== null
		) {
			nextEffect = child;
		} else {
			//向上遍历
			up: while (nextEffect !== null) {
				commitMutationEffectOnFiber(nextEffect);
				const sibling: FiberNode | null = nextEffect.sibling;

				if (sibling !== null) {
					nextEffect = sibling;
					break up;
				}
				nextEffect = nextEffect.return;
			}
		}
	}
};

const commitMutationEffectOnFiber = (finishedWork: FiberNode) => {
	const flags = finishedWork.flags;
	console.log(finishedWork);
	if ((flags & Placement) !== NoFlags) {
		commitPlacement(finishedWork);
		finishedWork.flags &= ~Placement;
	}

	//flags Update
	//flags ChildDeletion
};

const commitPlacement = (finishedWork: FiberNode) => {
	if (__DEV__) {
		console.warn('执行placement操作', finishedWork);
	}

	const hostParent = getHostParent(finishedWork);
	if (hostParent !== null) {
		appendPlacementNodeIntoContainer(finishedWork, hostParent);
	}
};

function getHostParent(fiber: FiberNode) {
	let parent = fiber.return;

	while (parent) {
		const parentTag = parent.tag;

		if (parentTag === HostComponent) {
			return parent.stateNode;
		}

		if (parentTag === HostRoot) {
			return parent.stateNode.container;
		}

		parent = parent.return;
	}

	if (__DEV__) {
		console.log('未找到parent');
	}
}

function appendPlacementNodeIntoContainer(
	finishedWork: FiberNode,
	hostParent: Container
) {
	if (!hostParent) {
		return;
	}
	if (finishedWork.tag === HostComponent || finishedWork.tag === HostText) {
		appendChildToContainer(hostParent, finishedWork.stateNode);
		return;
	}

	const child = finishedWork.child;
	if (child !== null) {
		appendPlacementNodeIntoContainer(child, hostParent);
		let sibling = child.sibling;

		while (sibling !== null) {
			appendPlacementNodeIntoContainer(sibling, hostParent);
			sibling = sibling.sibling;
		}
	}
}
