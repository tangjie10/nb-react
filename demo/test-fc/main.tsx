import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';

function renderIntoDocument(element) {
	const div = document.createElement('div');
	return ReactDOM.createRoot(div).render(element);
}

// const rootHost = ReactDOM.createRoot(
// 	document.getElementById('root') as Element
// );

// console.log('222222222');

// function App() {
// 	const [name, setName] = useState('tj');
// 	return (
// 		<div>
// 			<Child name={name}></Child>
// 		</div>
// 	);
// }

// function Child(props) {
// 	return <div>{props.name}</div>;
// }

// rootHost.render(<App />);

function Test(props) {
	return <div>{props.value}</div>;
}

console.log(renderIntoDocument(<Test value={+undefined} />));
