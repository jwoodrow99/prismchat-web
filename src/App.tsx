import { useEffect, useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom'; // Routes, Route, useNavigate, Link
import { Prism } from 'prismchat-lib';
import { db } from './Services/db';
import { messageUtils } from './Services/messageUtils';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

import HomePage from './Pages/HomePage';
import LoginPage from './Pages/AboutPage';

// import styles from './App.module.css';

function App() {
	// State
	const [openSetup, setOpenSetup] = useState(false);
	const [snackbarOpen, setSnackbarOpen] = useState(false);
	const [identityPublicKey, setIdentityPublickey] = useState(null);

	// Use Effect hook
	useEffect(() => {
		(async function () {
			let identityKeysCheck = await db.general
				.where('name')
				.equals('IdentityKeys')
				.first();

			if (identityKeysCheck === undefined) {
				setOpenSetup(true);
			} else {
				messageUtils.pull();
				setSnackbarOpen(true);
				setIdentityPublickey(identityKeysCheck.value.public);
				console.log(identityKeysCheck.value);
			}
		})();
	}, [identityPublicKey]);

	const createNewAccount = async () => {
		const prism: any = new Prism();
		await prism.init();
		let newlyGeneratedIdentityKeys = prism.generateIdentityKeys();

		// Add the new friend!
		await db.general.add({
			name: 'IdentityKeys',
			value: newlyGeneratedIdentityKeys,
		});

		setIdentityPublickey(newlyGeneratedIdentityKeys.public);
		setOpenSetup(false);
	};

	return (
		<div className="App">
			{/* Create account popup */}
			<Dialog open={openSetup}>
				<DialogTitle>Setup</DialogTitle>
				<DialogContent>
					<DialogContentText>
						We did not find any Prism keys in this browser. Do we have your
						permission to generate keys for you to start using the Prism Chat
						service?
					</DialogContentText>
					<DialogContentText>
						<b>This application is for demonstration purposes ONLY!</b>
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={createNewAccount}>Agree</Button>
					<Button
						color="error"
						onClick={() => {
							setOpenSetup(false);
						}}
					>
						Cancel
					</Button>
				</DialogActions>
			</Dialog>

			{/* Keys found alert */}
			<Snackbar
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
				open={snackbarOpen}
				onClose={() => {
					setSnackbarOpen(false);
				}}
				autoHideDuration={5000}
			>
				<Alert
					onClose={() => {
						setSnackbarOpen(false);
					}}
					severity="success"
				>
					Prism session detected!
				</Alert>
			</Snackbar>

			{/* Route pages */}
			<Routes>
				<Route path="/" element={<HomePage />} />
				<Route path="/about" element={<LoginPage />} />
			</Routes>
		</div>
	);
}

export default App;
