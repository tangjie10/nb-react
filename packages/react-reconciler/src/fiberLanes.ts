import { FiberRootNode } from './fiber';

export type Lane = number; //优先级
export type Lanes = number; //lane的集合

export const NoLanes = 0b000;
export const NoLane = 0b000;
export const SyncLane = 0b001;
//数字越小 优先级越高

export function mergeLanes(laneA: Lane, laneB: Lane): Lanes {
	return laneA | laneB;
}

export function requestUpdateLane() {
	return SyncLane;
}

export function getHighestPriorityLane(lanes: Lanes) {
	return lanes & -lanes;
}

export function markRootFinished(root: FiberRootNode, lane: Lane) {
	root.pendingLanes &= ~lane;
}
