import { ReactElementType } from 'shared/ReactTypes';
import { FiberNode } from './fiber';
import { UpdateQueue, processUpdateQueue } from './updateQueue';
import {
	FunctionComponent,
	HostComponent,
	HostRoot,
	HostText
} from './workTags';
import { mountChildFibers, reconcileChildFibers } from './childFibers';
import { renderWithHooks } from './fiberHooks';

//递归中的递阶段
export const beginWork = (wip: FiberNode) => {
	//返回子fiberNode
	switch (wip.tag) {
		case HostRoot:
			return updateHostRoot(wip);
		case HostComponent:
			return updateHostComponent(wip);
		case HostText:
			return null;
		case FunctionComponent:
			return updateFunctionComponent(wip);
		default:
			if (__DEV__) {
				console.warn('beginWork未实现的类型');
			}
	}
};

function updateHostRoot(wip: FiberNode) {
	const baseState = wip.memoizedState;
	const updateQueue = wip.updateQueue as UpdateQueue<Element>;
	const pending = updateQueue.shared.pending;
	const { memoizedState } = processUpdateQueue<Element>(baseState, pending);

	wip.memoizedState = memoizedState;

	const nextChildren = wip.memoizedState;
	reconcileChildren(wip, nextChildren as ReactElementType | undefined);
	return wip.child;
}

function updateHostComponent(wip: FiberNode) {
	const nextChildren = renderWithHooks(wip);
	reconcileChildren(wip, nextChildren);
	return wip.child;
}

// function App(){ return <div>2</div>}
function updateFunctionComponent(wip: FiberNode) {
	const nextProp = wip.pendingProps;
	const nextChildren = nextProp.children;
	reconcileChildren(wip, nextChildren);
	return wip.child;
}

function reconcileChildren(wip: FiberNode, children?: ReactElementType) {
	const current = wip.alternate;
	if (current !== null) {
		//更新
		wip.child = reconcileChildFibers(wip, current.child, children);
	} else {
		//mount
		wip.child = mountChildFibers(wip, null, children);
	}
	return wip.child;
}
