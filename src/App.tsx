import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom'; // Routes, Route, useNavigate, Link
import { Prism } from 'prismchat-lib';
import { db } from './Services/db';
import { messageUtils } from './Services/messageUtils';
import authUtil from './Services/authUtil';

import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import GeneralNotificationComponent from './Components/GeneralNotificationComponent';

import HomePage from './Pages/HomePage';
import LoginPage from './Pages/AboutPage';

// import styles from './App.module.css';

function App() {
	// State
	const [openSetup, setOpenSetup] = useState(false);
	const [keysFoundNotify, setKeysFoundNotify] = useState(false);
	const [copyIdentityKeyNotify, setCopyIdentityKeyNotify] = useState(false);
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
				setKeysFoundNotify(true);
				setIdentityPublickey(identityKeysCheck.value.public);
			}
		})();
	}, [identityPublicKey]);

	const createNewAccount = async () => {
		const prism: any = new Prism();
		await prism.init();
		let newlyGeneratedIdentityKeys = prism.generateIdentityKeys();

		const prism2: any = new Prism();
		await prism2.init();
		let newlyGeneratedBoxKeys = prism2.generateIdentityKeys();

		// Create new account
		await db.general.add({
			name: 'IdentityKeys',
			value: newlyGeneratedIdentityKeys,
		});

		// Create box keys
		await db.general.add({
			name: 'BoxKeys',
			value: newlyGeneratedBoxKeys,
		});

		// Auth to server
		await authUtil.init();

		setIdentityPublickey(newlyGeneratedIdentityKeys.public);
		setOpenSetup(false);
	};

	return (
		<div className="App">
			<Box
				sx={{
					maxHeight: '100vh',
				}}
			>
				<AppBar position="static" sx={{ height: '64px' }}>
					<Toolbar>
						<IconButton
							size="large"
							edge="start"
							color="inherit"
							aria-label="menu"
							sx={{ mr: 2 }}
						>
							<MenuIcon />
						</IconButton>
						<Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
							Prism Chat Web
						</Typography>
						<Box
							sx={{
								'&:hover': {
									cursor: 'copy',
								},
							}}
							onClick={() => {
								navigator.clipboard.writeText(identityPublicKey || '');
								setCopyIdentityKeyNotify(true);
							}}
						>
							{identityPublicKey}
						</Box>
					</Toolbar>
				</AppBar>

				{/* Create account popup */}
				<Dialog open={openSetup}>
					<DialogTitle>Setup</DialogTitle>
					<DialogContent>
						<DialogContentText>
							We did not find any Prism keys in this browser. Do we have your
							permission to generate keys for you to start using the Prism Chat
							service?
						</DialogContentText>
						<br />
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

				{/* Notifications */}
				<GeneralNotificationComponent
					type="success"
					message="Prism session detected!"
					open={keysFoundNotify}
					setOpen={setKeysFoundNotify}
				/>

				<GeneralNotificationComponent
					type="success"
					message="Your Public Identity Key was coppiced!"
					open={copyIdentityKeyNotify}
					setOpen={setCopyIdentityKeyNotify}
				/>

				{/* Route pages */}
				<Routes>
					<Route path="/" element={<HomePage />} />
					<Route path="/about" element={<LoginPage />} />
				</Routes>
			</Box>
		</div>
	);
}

export default App;
