import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';

const rootHost = ReactDOM.createRoot(
	document.getElementById('root') as Element
);

console.log([
	<li key="1" ref="333">
		1
	</li>,
	<li key="2">2</li>,
	<li key="3">3</li>
]);
function App() {
	const [name, setName] = useState('child');
	const [num, setNum] = useState(0);
	const arr =
		num % 2 === 0
			? [<li key="1">1</li>, <li key="2">2</li>, <li key="3">3</li>]
			: [<li key="3">3</li>, <li key="2">2</li>, <li key="1">1</li>];
	window.setName = setName;
	return <ul onClickCapture={() => setNum(num + 1)}>{arr}</ul>;
}

function Child() {
	return <div>nb-child</div>;
}

rootHost.render(<App />);
