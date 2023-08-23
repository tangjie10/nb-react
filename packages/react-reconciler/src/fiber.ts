import { Props, Key, Ref, Type, ReactElementType } from 'shared/ReactTypes';
import { FunctionComponent, HostComponent, WorkTag } from './workTags';
import { Flags, NoFlags } from './fiberFlags';
import { Container } from 'hostConfig';
export class FiberNode {
	tag: WorkTag;
	key: Key;
	type: Type;
	stateNode: any;
	return: FiberNode | null;
	sibling: FiberNode | null;
	child: FiberNode | null;
	ref: Ref;
	index: number;
	pendingProps: Props;
	memoizedProps: Props | null;
	memoizedState: any;
	//current -> workInProgress workInProgress -> current
	alternate: FiberNode | null;
	flags: Flags;
	subTreeFlags: Flags;
	updateQueue: unknown;

	constructor(tag: WorkTag, pendingProps: Props, key: Key) {
		this.tag = tag;
		this.key = key;
		this.stateNode = null;
		this.type = null;

		// 指向父亲的fiberNode
		this.return = null;
		// 指向右边的fiberNode
		this.sibling = null;
		// 指向右边的fiberNode
		this.child = null;
		//在兄弟之间排第几  下标值
		this.index = 0;

		this.ref = null;

		//当前fiberNode开始准备工作的props
		this.pendingProps = pendingProps;
		//当前fiberNode工作完成的props
		this.memoizedProps = null;

		this.updateQueue = null;
		this.memoizedState = null;
		//current -> workInProgress workInProgress -> current
		this.alternate = null;
		//需要进行什么操作 如新增 删除 无操作
		this.flags = NoFlags;
		this.subTreeFlags = NoFlags;
	}
}

export class FiberRootNode {
	container: Container; //宿主环境不同  container不同 如果是浏览器环境 那代表的是dom节点
	current: FiberNode;
	finishedWork: FiberNode | null;
	constructor(container: Container, hostRootFiber: FiberNode) {
		this.container = container;
		this.current = hostRootFiber;
		hostRootFiber.stateNode = this;
		this.finishedWork = null;
	}
}

export function createWorkInProgress(
	current: FiberNode,
	pendingProps: Props
): FiberNode {
	let wip = current.alternate;
	if (wip === null) {
		// mount
		wip = new FiberNode(current.tag, pendingProps, current.key);
		wip.stateNode = current.stateNode;
		wip.alternate = current;
		current.alternate = wip;
	} else {
		// update
		wip.pendingProps = current.pendingProps;
		wip.flags = NoFlags;
	}

	wip.type = current.type;
	wip.updateQueue = current.updateQueue;
	wip.memoizedProps = current.memoizedProps;
	wip.memoizedState = current.memoizedState;
	wip.child = current.child;
	return wip;
}

export function createFiberFromElement(element: ReactElementType) {
	const { key, type, props } = element;
	let fiberTag: WorkTag = FunctionComponent;

	if (typeof type === 'string') {
		fiberTag = HostComponent;
	} else if (typeof type !== 'function') {
		if (__DEV__) {
			console.warn('未定义的type类型', element);
		}
	}
	const fiber = new FiberNode(fiberTag, props, key);
	fiber.type = type;
	return fiber;
}
