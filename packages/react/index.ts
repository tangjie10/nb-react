import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols';
import currentDispatcher, {
	Dispatcher,
	resolveDispatcher
} from './src/currentDispatcher';
import { jsx } from './src/jsx';

export const useState: Dispatcher['useState'] = (initialState: any) => {
	const dispatcher = resolveDispatcher();
	if (dispatcher) {
		return dispatcher.useState(initialState);
	} else {
		throw new Error('dispatcher为null');
	}
};

//内部数据共享层
export const _SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = {
	currentDispatcher
};

export const version = '0.0.1';

export const createElement = jsx;

export const isValidElement = (object: any) => {
	return (
		typeof object === 'object' &&
		object !== null &&
		object.$$typeof === REACT_ELEMENT_TYPE
	);
};
