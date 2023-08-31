import * as React from 'react';
import { useState } from 'react';

import ReactDOM from 'react-dom/client';
// console.log([
// 	<li key="1" ref="333">
// 		1
// 	</li>,
// 	<li key="2">2</li>,
// 	<li key="3">3</li>
// ]);

const rootHost = ReactDOM.createRoot(
	document.getElementById('root') as Element
);

function App() {
	const [name, setName] = useState('child');
	const [num, setNum] = useState(0);
	const arr =
		num % 2 === 0
			? [<li key="5">5</li>, <li key="6">6</li>, <li key="7">7</li>]
			: [<li key="6">6</li>, <li key="5">5</li>, <li key="7">7</li>];
	window.setName = setName;

	const testFn = () => {
		setNum((num) => num + 1);
		setNum((num) => num + 1);
		setNum((num) => num + 1);
		setNum((num) => num + 1);
		setNum((num) => num + 1);
	};

	return (
		<ul onClickCapture={testFn}>
			<>
				<li>1</li>
				<li>2</li>
			</>

			{arr}
		</ul>
	);
}

function Child() {
	return <div>nb-child</div>;
}

rootHost.render(<App />);
