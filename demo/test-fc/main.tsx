import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';

const rootHost = ReactDOM.createRoot(
	document.getElementById('root') as Element
);

console.log('222222222');

function App() {
	const [name, setName] = useState('tj');
	return (
		<div>
			<Child name={name}></Child>
		</div>
	);
}

function Child(props) {
	return <div>{props.name}</div>;
}

rootHost.render(<App />);
