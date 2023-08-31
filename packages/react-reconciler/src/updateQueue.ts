import { Dispatch } from 'react/src/currentDispatcher';
import { Action } from 'shared/ReactTypes';
import { Lane } from './fiberLanes';

export interface Update<State> {
	action: Action<State>;
	next: Update<any> | null;
	lane: Lane;
}

export interface UpdateQueue<State> {
	shared: {
		pending: Update<State> | null;
	};
	dispatch: Dispatch<State> | null;
}

export const createUpdate = <State>(
	action: Action<State>,
	lane: Lane
): Update<State> => {
	return {
		action,
		next: null,
		lane
	};
};

export const createUpdateQueue = <State>() => {
	return {
		shared: {
			pending: null
		}
	} as UpdateQueue<State>;
};

export const enqueueUpdate = <State>(
	UpdateQueue: UpdateQueue<State>,
	update: Update<State>
) => {
	const pending = UpdateQueue.shared.pending;
	if (!pending) {
		update.next = update;
	} else {
		update.next = pending.next;
		pending.next = update;
	}

	UpdateQueue.shared.pending = update;
};

export const processUpdateQueue = <State>(
	baseState: State,
	pendingUpdate: Update<State> | null,
	renderLane: Lane
): { memoizedState: State } => {
	const result: ReturnType<typeof processUpdateQueue<State>> | null = {
		memoizedState: baseState
	};
	if (pendingUpdate !== null) {
		//第一个update
		const first = pendingUpdate.next;
		let pending = pendingUpdate as Update<any>;
		do {
			const currentLane = pending.lane;
			if (currentLane === renderLane) {
				const action = pending.action;
				if (action instanceof Function) {
					baseState = action(baseState);
				} else {
					baseState = action;
				}
			} else {
				if (__DEV__) {
					console.error('不应该进入这个逻辑');
				}
			}
			pending = pending.next as Update<any>;
		} while (pending !== first);

		//baseState 1 update 2 - > memoizedState 2
		//baseState 1 update x=>4x - > memoizedState 4
	}
	result.memoizedState = baseState;
	return result;
};
