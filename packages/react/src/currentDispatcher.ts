import { Action } from 'shared/ReactTypes';

export interface Dispatcher {
	useState: <T>(initialState: (() => T) | T) => [T, Dispatch<T>];
	useEffect: (callback: (() => void) | void, deps: any[] | void) => void;
}
export type Dispatch<state> = (action: Action<state>) => void;

const currentDispatcher: { current: Dispatcher | null } = {
	current: null
};

export const resolveDispatcher = () => {
	const dispatcher = currentDispatcher.current;

	if (dispatcher === null) {
		console.warn('hooks应该在最外层使用');
	}
	return dispatcher;
};
export default currentDispatcher;
