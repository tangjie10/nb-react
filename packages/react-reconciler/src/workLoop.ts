import { scheduleMicro } from 'hostConfig';
import { beginWork } from './beiginWork';
import { commitMutationEffects } from './commitWork';
import { completeWork } from './completeWork';
import { FiberNode, FiberRootNode, createWorkInProgress } from './fiber';
import { MutationMask, NoFlags } from './fiberFlags';
import {
	Lane,
	NoLane,
	SyncLane,
	getHighestPriorityLane,
	markRootFinished,
	mergeLanes
} from './fiberLanes';
import { flushSyncCallbacks, scheduleSyncCallback } from './syncTaskQueue';
import { HostRoot } from './workTags';

let workInProgress: FiberNode | null = null;
let wipRootRenderLane: Lane = NoLane;

function prepareFreshStack(root: FiberRootNode, lane: Lane) {
	workInProgress = createWorkInProgress(root.current, {});
	wipRootRenderLane = lane;
}

export function scheduleUpdateOnFiber(fiber: FiberNode, lane: Lane) {
	//TODO 调度功能
	const root = markUpdateFromFiberRoot(fiber);
	markRootUpdate(root, lane);
	ensureRootIsScheduled(root);
}

function ensureRootIsScheduled(root: FiberRootNode) {
	const updateLane = getHighestPriorityLane(root.pendingLanes);
	if (updateLane === NoLane) {
		return;
	}
	if (updateLane === SyncLane) {
		//同步优先级 用微任务调度
		if (__DEV__) {
			console.warn('在微任务中调度');
		}
		scheduleSyncCallback(performSyncWorkOnRoot.bind(null, root, updateLane));
		scheduleMicro(flushSyncCallbacks);
	} else {
		//其他优先级 用宏任务调度
	}
}

function markRootUpdate(root: FiberRootNode, lane: Lane) {
	root.pendingLanes = mergeLanes(root.pendingLanes, lane);
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

// 同步更新入口 ReactDOM.createRoot().render this.setState useState的dispatch方法  触发更新时候调用的
function performSyncWorkOnRoot(root: FiberRootNode, updateLane: Lane) {
	const nextLane = getHighestPriorityLane(root.pendingLanes);
	if (nextLane !== SyncLane) {
		//NoLane 获取其他优先级
		// 保险起见  再调用一次
		ensureRootIsScheduled(root);
		return;
	}

	//初始化
	prepareFreshStack(root, updateLane);

	do {
		try {
			workLoop(updateLane);
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
	root.finishedLane = updateLane;
	wipRootRenderLane = NoLane;
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
	if (root.finishedLane === NoLane && __DEV__) {
		console.warn('commit阶段finishedLane不应该出现NoLane');
	}

	markRootFinished(root, root.finishedLane);

	root.finishedWork = null;
	root.finishedLane = NoLane;
	//判断是否存在3个子阶段需要执行的操作

	const subtreeHasEffect =
		(finishedWork.subTreeFlags & MutationMask) != NoFlags;
	const rootHasEffect = (finishedWork.flags & MutationMask) != NoFlags;

	if (subtreeHasEffect || rootHasEffect) {
		// beforeMutation阶段
		// mutation阶段
		commitMutationEffects(finishedWork);
		root.current = finishedWork;
		// layout阶段
	} else {
		root.current = finishedWork;
	}
}

function workLoop(lane: Lane) {
	while (workInProgress !== null) {
		preformUnitOfWork(workInProgress, lane);
	}
}

function preformUnitOfWork(fiber: FiberNode, lane: Lane) {
	const next = beginWork(fiber, lane);
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
