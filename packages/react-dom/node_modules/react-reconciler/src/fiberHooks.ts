import { FiberNode } from './fiber';

export function renderWithHooks(wip: FiberNode) {
	const fn = wip.type;
	const props = wip.pendingProps;
	const children = fn(props);

	return children;
}
