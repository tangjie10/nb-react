import { beginWork } from './beiginWork';
import { commitMutationEffects } from './commitWork';
import { completeWork } from './completeWork';
import { FiberNode, FiberRootNode, createWorkInProgress } from './fiber';
import { MutationMask, NoFlags } from './fiberFlags';
import { HostRoot } from './workTags';

let workInProgress: FiberNode | null = null;

function prepareFreshStack(root: FiberRootNode) {
	workInProgress = createWorkInProgress(root.current, {});
}

export function scheduleUpdateOnFiber(fiber: FiberNode) {
	//TODO 调度功能
	const root = markUpdateFromFiberRoot(fiber);
	renderRoot(root);
}

function markUpdateFromFiberRoot(fiber: FiberNode) {
	let node = fiber;
	let parent = node.return;

	while (parent !== null) {
		node = parent;
		parent = node.return;
	}

	if (node.tag === HostRoot) {
		return node.stateNode;
	}

	return null;
}

// ReactDOM.createRoot().render this.setState useState的dispatch方法  触发更新时候调用的
function renderRoot(root: FiberRootNode) {
	//初始化
	prepareFreshStack(root);

	do {
		try {
			workLoop();
			break;
		} catch (e) {
			if (__DEV__) {
				console.warn('workLoop发生错误', e);
			}
			workInProgress = null;
		}
	} while (true);

	const finishedWork = root.current.alternate;
	root.finishedWork = finishedWork;
	// 得到wip树 以及fibernode所标记的flags后
	commitRoot(root);
}

function commitRoot(root: FiberRootNode) {
	const finishedWork = root.finishedWork;

	if (finishedWork === null) {
		return;
	}

	if (__DEV__) {
		console.warn('commit阶段开始', finishedWork);
	}
	root.finishedWork = null;

	//判断是否存在3个子阶段需要执行的操作

	const subtreeHasEffect =
		(finishedWork.subTreeFlags & MutationMask) != NoFlags;
	const rootHasEffect = (finishedWork.flags & MutationMask) != NoFlags;

	if (subtreeHasEffect || rootHasEffect) {
		// beforeMutation阶段
		// mutation阶段
		console.log(finishedWork);
		commitMutationEffects(finishedWork);
		root.current = finishedWork;
		// layout阶段
	} else {
		root.current = finishedWork;
	}
}

function workLoop() {
	while (workInProgress !== null) {
		preformUnitOfWork(workInProgress);
	}
}

function preformUnitOfWork(fiber: FiberNode) {
	const next = beginWork(fiber);
	fiber.memoizedProps = fiber.pendingProps;

	if (next === null) {
		completeUnitOfWork(fiber);
	} else {
		workInProgress = next as FiberNode | null;
	}
}

function completeUnitOfWork(fiber: FiberNode) {
	let node: FiberNode | null = fiber;

	do {
		completeWork(node);
		const sibling = node.sibling;
		if (sibling !== null) {
			workInProgress = sibling;
			return;
		}
		node = node.return;
		workInProgress = node;
	} while (node !== null);
}
