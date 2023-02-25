import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';

import { db } from './Services/db';
import authUtil from './Services/authUtil';
import { messageUtils } from './Services/messageUtils';

const root = ReactDOM.createRoot(
	document.getElementById('root') as HTMLElement
);

(async function () {
	let identityKeysCheck = await db.general
		.where('name')
		.equals('IdentityKeys')
		.first();

	// Checks if you are a user or not
	if (identityKeysCheck) {
		// authenticate
		const { cypherText, nonce } = await authUtil.request();
		const access_token = await authUtil.verify(cypherText, nonce);
		localStorage.setItem('access_token', access_token);

		await messageUtils.get();
	}

	// Ping messages
	setInterval(async () => {
		let identityKeysCheck = await db.general
			.where('name')
			.equals('IdentityKeys')
			.first();

		if (identityKeysCheck) {
			await messageUtils.get();
		}
	}, 10000);
})();

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
