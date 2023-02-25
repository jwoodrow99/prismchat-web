import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';

import { db } from './Services/db';
import { messageUtils } from './Services/messageUtils';
import authUtil from './Services/authUtil';

const authenticate = async () => {
	let identityKeys = await db.general
		.where('name')
		.equals('IdentityKeys')
		.first();

	if (identityKeys) {
		const { cypherText, nonce } = await authUtil.request();
		const access_token = await authUtil.verify(cypherText, nonce);
		localStorage.setItem('access_token', access_token);
	}
};

const getMessages = async () => {
	let identityKeys = await db.general
		.where('name')
		.equals('IdentityKeys')
		.first();

	if (identityKeys) {
		await messageUtils.get();
	}
};

// Main setup process
(async function () {
	await authenticate();
	await getMessages();

	setInterval(async () => {
		await getMessages();
	}, 10000);
})();

const root = ReactDOM.createRoot(
	document.getElementById('root') as HTMLElement
);

root.render(
	<React.StrictMode>
		<BrowserRouter>
			<App />
		</BrowserRouter>
	</React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
