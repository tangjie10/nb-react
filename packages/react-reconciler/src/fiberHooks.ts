import { Dispatch, Dispatcher } from 'react/src/currentDispatcher';
import { FiberNode } from './fiber';
import internals from 'shared/internals';
import {
	UpdateQueue,
	createUpdate,
	createUpdateQueue,
	enqueueUpdate,
	processUpdateQueue
} from './updateQueue';
import { Action } from 'shared/ReactTypes';
import { scheduleUpdateOnFiber } from './workLoop';
import { Lane, NoLane, requestUpdateLane } from './fiberLanes';
import { Flags, PassiveEffect } from './fiberFlags';
import { HookHasEffect, Passive } from './hookEffectTags';

let currentlyRenderingFiber: FiberNode | null = null;
let workInProgressHook: Hook | null = null;
let currentHook: Hook | null = null;
let renderLane: Lane = NoLane;

const { currentDispatcher } = internals;
interface Hook {
	next: Hook | null;
	memoizedState: any; //指向当前Hook自身状态的值  不是fiber上的memoizedState
	updateQueue: unknown;
}

export interface Effect {
	tag: Flags;
	create: EffectCallback | void;
	destroy: EffectCallback | void;
	deps: EffectDeps | null;
	next: Effect | null;
}

export interface FCUpdateQueue<State> extends UpdateQueue<State> {
	lastEffect: Effect | null;
}

export type EffectCallback = () => void;
export type EffectDeps = any[] | void;

export function renderWithHooks(wip: FiberNode, lane: Lane) {
	//赋值操作
	currentlyRenderingFiber = wip;
	wip.memoizedState = null;
	renderLane = lane;
	const current = wip.alternate;

	if (current !== null) {
		//update
		currentDispatcher.current = hooksDispatcherOnUpdate;
	} else {
		//mount
		currentDispatcher.current = hooksDispatcherOnMount;
	}

	const fn = wip.type;
	const props = wip.pendingProps;
	//render
	const children = fn(props);

	//重置操作
	currentlyRenderingFiber = null;
	workInProgressHook = null;
	currentHook = null;

	renderLane = NoLane;
	return children;
}

const hooksDispatcherOnMount: Dispatcher = {
	useState: mountState,
	useEffect: mountEffect
};

function mountEffect(create: EffectCallback | void, deps: EffectDeps | null) {
	const hook = mountWorkInProgressHook();
	const nextDeps = deps === undefined ? null : deps;
	(currentlyRenderingFiber as FiberNode).flags |= PassiveEffect;

	hook.memoizedState = pushEffect(
		Passive | HookHasEffect,
		create,
		undefined,
		deps
	);
}

function pushEffect(
	hookFlags: Flags,
	create: EffectCallback | void,
	destroy: EffectCallback | void,
	deps: EffectDeps | null
): Effect {
	const effect: Effect = {
		tag: hookFlags,
		create,
		destroy,
		deps,
		next: null
	};
	const fiber = currentlyRenderingFiber as FiberNode;
	const updateQueue = fiber.updateQueue as FCUpdateQueue<any>;
	if (updateQueue === null) {
		const updateQueue = createFCUpdateQueue();
		fiber.updateQueue = updateQueue;
		effect.next = effect;
		updateQueue.lastEffect = effect;
	} else {
		//插入effect
		const lastEffect = updateQueue.lastEffect;
		if (lastEffect === null) {
			effect.next = effect;
			updateQueue.lastEffect = effect;
		} else {
			const firstEffect = lastEffect.next;
			lastEffect.next = effect;
			effect.next = firstEffect;
			updateQueue.lastEffect = effect;
		}
	}
	return effect;
}

function createFCUpdateQueue<State>() {
	const updateQueue = createUpdateQueue<State>() as FCUpdateQueue<State>;
	updateQueue.lastEffect = null;
	return updateQueue;
}

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
		hook.updateQueue as any
	);
	queue.dispatch = dispatch;
	return [memoizedState, dispatch];
}

function dispatchSetState<T>(
	fiber: FiberNode,
	updateQueue: UpdateQueue<T>,
	action: Action<T>
) {
	const lane = requestUpdateLane();
	const update = createUpdate(action, lane);
	enqueueUpdate(updateQueue, update);
	scheduleUpdateOnFiber(fiber, lane);
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

function updateWorkInProgressHook(): Hook {
	let nextCurrentHook: Hook | null;
	if (currentHook === null) {
		//update第一个hook
		const current = currentlyRenderingFiber?.alternate;
		if (current !== null) {
			nextCurrentHook = current?.memoizedState;
		} else {
			nextCurrentHook = null;
		}
	} else {
		//update后续hook
		nextCurrentHook = currentHook.next;
	}

	if (nextCurrentHook === null) {
		//mount/update u1 u2 u3
		//update u1 u2 u3 u4
	}

	currentHook = nextCurrentHook as Hook;
	const newHook: Hook = {
		memoizedState: currentHook.memoizedState,
		updateQueue: currentHook.updateQueue,
		next: null
	};

	if (workInProgressHook === null) {
		//mount时候 第一个hook
		if (currentlyRenderingFiber === null) {
			throw new Error('请在函数组件内调用hook');
		} else {
			workInProgressHook = newHook;
			currentlyRenderingFiber.memoizedState = workInProgressHook;
		}
	} else {
		//后续的hook
		workInProgressHook.next = newHook;
		workInProgressHook = newHook;
	}

	return workInProgressHook;
}

const hooksDispatcherOnUpdate: Dispatcher = {
	useState: updateState
};

function updateState<T>(initialState: (() => T) | T): [T, Dispatch<T>] {
	const hook = updateWorkInProgressHook();
	//计算新state的逻辑
	const queue = hook.updateQueue as UpdateQueue<T>;
	const pending = queue.shared.pending;
	queue.shared.pending = null;

	if (pending !== null) {
		const { memoizedState } = processUpdateQueue(
			hook.memoizedState,
			pending,
			renderLane
		);
		hook.memoizedState = memoizedState;
	}
	return [hook.memoizedState, queue.dispatch as Dispatch<T>];
}
