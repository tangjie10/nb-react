import { Dispatch, Dispatcher } from 'react/src/currentDispatcher';
import { FiberNode } from './fiber';
import internals from 'shared/internals';
import {
	UpdateQueue,
	createUpdate,
	createUpdateQueue,
	enqueueUpdate
} from './updateQueue';
import { Action } from 'shared/ReactTypes';
import { scheduleUpdateOnFiber } from './workLoop';

let currentlyRenderingFiber: FiberNode | null = null;
let workInProgressHook: Hook | null = null;
const { currentDispatcher } = internals;
interface Hook {
	next: Hook | null;
	memoizedState: any; //指向当前Hook自身状态的值  不是fiber上的memoizedState
	updateQueue: unknown;
}

export function renderWithHooks(wip: FiberNode) {
	//赋值操作
	currentlyRenderingFiber = wip;
	wip.memoizedState = null;

	const current = wip.alternate;

	if (current !== null) {
		//update
		// currentDispatcher.current = hooksDispatcherOnUpdate;
	} else {
		//mount
		currentDispatcher.current = hooksDispatcherOnMount;
	}

	const fn = wip.type;
	const props = wip.pendingProps;
	const children = fn(props);

	//重置操作
	currentlyRenderingFiber = null;

	return children;
}

const hooksDispatcherOnMount: Dispatcher = {
	useState: mountState
};

function mountState<T>(initialState: (() => T) | T): [T, Dispatch<T>] {
	const hook = mountWorkInProgressHook();
	let memoizedState;
	if (initialState instanceof Function) {
		memoizedState = initialState();
	} else {
		memoizedState = initialState;
	}
	const queue = createUpdateQueue();
	hook.updateQueue = queue;

	const dispatch = dispatchSetState.bind(
		null,
		currentlyRenderingFiber as FiberNode,
		queue
	);
	queue.dispatch = dispatch;
	return [memoizedState, dispatch];
}

function dispatchSetState<T>(
	fiber: FiberNode,
	updateQueue: UpdateQueue<T>,
	action: Action<T>
) {
	const update = createUpdate(action);
	enqueueUpdate(updateQueue, update);
	scheduleUpdateOnFiber(fiber);
}

function mountWorkInProgressHook(): Hook {
	const hook: Hook = {
		memoizedState: null,
		updateQueue: null,
		next: null
	};
	if (workInProgressHook === null) {
		//mount时候 第一个hook
		if (currentlyRenderingFiber === null) {
			throw new Error('请在函数组件内调用hook');
		} else {
			workInProgressHook = hook;
			currentlyRenderingFiber.memoizedState = workInProgressHook;
		}
	} else {
		//后续的hook
		workInProgressHook.next = hook;
		workInProgressHook = hook;
	}

	return workInProgressHook;
}

// const hooksDispatcherOnUpdate: Dispatcher = {
// 	useState: mountUpdate
// };

// function mountUpdate() {}
