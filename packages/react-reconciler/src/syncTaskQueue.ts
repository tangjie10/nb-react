let syncQueue: ((...args: any) => void)[] | null = null;
let isFlushingSyncCallback = false;

export function scheduleSyncCallback(callback: (...args: any) => void) {
	if (syncQueue === null) {
		syncQueue = [callback];
	} else {
		syncQueue.push(callback);
	}
}

export function flushSyncCallbacks() {
	if (isFlushingSyncCallback || !syncQueue) {
		return;
	}
	isFlushingSyncCallback = true;
	try {
		syncQueue?.forEach((callback) => callback());
	} catch (e) {
		if (__DEV__) {
			console.error('flushSyncCallbacks错误', e);
		}
	} finally {
		isFlushingSyncCallback = false;
		syncQueue = null;
	}
}
