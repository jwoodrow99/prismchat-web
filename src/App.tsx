import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom'; // Routes, Route, useNavigate, Link
import prismClient from './Services/prismClient';
import { db } from './Services/db';
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
import Tooltip from '@mui/material/Tooltip';

import QrCode2Icon from '@mui/icons-material/QrCode2';
import KeyIcon from '@mui/icons-material/Key';

import QrDialogueComponent from './Components/QrDialogueComponent';
import GeneralNotificationComponent from './Components/GeneralNotificationComponent';

import HomePage from './Pages/HomePage';

import styles from './App.module.css';

function App() {
	// State
	const [drawerOpen, setDrawerOpen] = useState(true);
	const [identityPublicKey, setIdentityPublickey] = useState(null);
	const [openSetup, setOpenSetup] = useState(false);
	const [openQR, setOpenQR] = useState(false);
	const [keysFoundNotify, setKeysFoundNotify] = useState(false);
	const [copyIdentityKeyNotify, setCopyIdentityKeyNotify] = useState(false);

	// Use Effect hook
	useEffect(() => {
		(async function () {
			let identityKeysCheck = await db.general
				.where('name')
				.equals('IdentityKeys')
				.first();

			if (!identityKeysCheck) {
				setOpenSetup(true);
			} else {
				setIdentityPublickey(identityKeysCheck.value.public);
			}
		})();
	});

	const createNewAccount: any = async () => {
		// Create new account & IdentityKeys
		const prism: any = await prismClient.init();
		await db.general.add({
			name: 'IdentityKeys',
			value: prism.IdentityKeys,
		});

		// Create new box keys
		const prismBox: any = await prismClient.init();
		const generatedBoxKeys = prismBox.generateIdentityKeys();
		await db.general.add({
			name: 'BoxKeys',
			value: generatedBoxKeys,
		});

		// Authenticate
		const { cypherText, nonce } = await authUtil.request();
		const access_token = await authUtil.verify(cypherText, nonce);
		localStorage.setItem('access_token', access_token);

		// Close creation dialogue
		setOpenSetup(false);
	};

	return (
		<div className="App">
			<Box
				sx={{
					maxHeight: 'calc(var(--vh, 1vh) * 100)',
				}}
			>
				{/* App Bar */}
				<AppBar position="static" sx={{ height: '64px' }}>
					<Toolbar
						sx={{
							height: '64px',
						}}
					>
						<IconButton
							size="large"
							edge="start"
							color="inherit"
							aria-label="menu"
							onClick={() => {
								setDrawerOpen(true);
							}}
						>
							<MenuIcon />
						</IconButton>
						<Box
							sx={{
								flexGrow: 1,
							}}
						>
							<img
								className={styles.logoImage}
								src={process.env.PUBLIC_URL + '/logo/logo.png'}
								alt="Prism Chat logo"
							/>
						</Box>
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
							<Box sx={{ display: { xs: 'none', sm: 'block', md: 'block' } }}>
								{identityPublicKey}
							</Box>
							<Box sx={{ display: { xs: 'block', sm: 'none', md: 'none' } }}>
								<Tooltip title="Copy identity key">
									<KeyIcon />
								</Tooltip>
							</Box>
						</Box>
						<Box
							sx={{
								marginLeft: '10px',
								'&:hover': {
									cursor: 'pointer',
								},
							}}
							onClick={() => {
								setOpenQR(true);
							}}
						>
							<Tooltip title="Show identity key QR">
								<QrCode2Icon />
							</Tooltip>
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

				<QrDialogueComponent open={openQR} setOpen={setOpenQR} />

				{/* Notifications */}
				<GeneralNotificationComponent
					type="success"
					message="Resume existing Prism Chat!"
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
					<Route
						path="/"
						element={
							<HomePage drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen} />
						}
					/>
				</Routes>
			</Box>
		</div>
	);
}

export default App;
