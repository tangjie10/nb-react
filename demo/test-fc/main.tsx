import * as React from 'react';
import { useState } from 'react';

import ReactDOM from 'react-dom/client';
console.log([
	<li key="1" ref="333">
		1
	</li>,
	<li key="2">2</li>,
	<li key="3">3</li>
]);

const rootHost = ReactDOM.createRoot(
	document.getElementById('root') as Element
);

function App() {
	const [name, setName] = useState('child');
	const [num, setNum] = useState(0);
	const arr =
		num % 2 === 0
			? [<li key="5">1</li>, <li key="6">2</li>, <li key="7">3</li>]
			: [<li key="6">3</li>, <li key="5">2</li>, <li key="7">1</li>];
	window.setName = setName;
	return (
		<ul onClickCapture={() => setNum(num + 1)}>
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
