export type Container = Element;
export type Instance = Element;

export function createInstance(type: string, props: any): Instance {
	console.log(props);
	return document.createElement(type);
}

export function appendInitialChild(
	parent: Instance | Container,
	child: Instance
) {
	console.log(parent, child);
	parent.appendChild(child);
}

export function createTextInstance(content: string) {
	return document.createTextNode(content);
}

export const appendChildToContainer = appendInitialChild;
