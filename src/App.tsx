import { useEffect, useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom'; // Routes, Route, useNavigate, Link
import { Prism } from 'prismchat-lib';
import { db } from './Services/db';

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

	const cancelAccountCreation = () => {
		console.log('Cancel Creation');
		setOpenSetup(false);
	};

	const handleSnackbarClose = () => {
		setSnackbarOpen(false);
	};

	return (
		<div className="App">
			{/* <h1>Prism Chat Web</h1> */}

			{/* <nav>
				<ul>
					<li>
						<Link to={'/'}>Home</Link>
					</li>
					<li>
						<Link to={'/about'}>About</Link>
					</li>
				</ul>
			</nav> */}

			<Dialog open={openSetup}>
				<DialogTitle>Setup</DialogTitle>
				<DialogContent>
					<DialogContentText>
						We did not find any Prism keys in this browser. Do we have your
						permission to generate keys for you to start using the Prism Cat
						service?
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={createNewAccount}>Agree</Button>
					<Button onClick={cancelAccountCreation}>Cancel</Button>
				</DialogActions>
			</Dialog>

			<Snackbar
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
				open={snackbarOpen}
				onClose={handleSnackbarClose}
				autoHideDuration={5000}
			>
				<Alert onClose={handleSnackbarClose} severity="success">
					Prism session detected!
				</Alert>
			</Snackbar>

			{/* <Snackbar
				open={snackbarOpen}
				autoHideDuration={5000}
				onClose={handleClose}
				message="Note archived"
				action={action}
			/> */}

			<Routes>
				<Route path="/" element={<HomePage />} />
				<Route path="/about" element={<LoginPage />} />
			</Routes>
		</div>
	);
}

export default App;
