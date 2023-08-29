import { Container } from 'hostConfig';
import {
	createContainer,
	updateContainer
} from 'react-reconciler/src/fiberReconclier';
import { ReactElementType } from 'shared/ReactTypes';
import { initEvent } from './SyntheicEvent';

//ReactDOM.createRoot(root).render(<app/>)
export function createRoot(container: Container) {
	const root = createContainer(container);

	return {
		render(element: ReactElementType) {
			initEvent(container, 'click');
			return updateContainer(element, root);
		}
	};
}
