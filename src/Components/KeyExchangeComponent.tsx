import { useEffect, useState } from 'react';
import api from '../Services/api';
import { db } from '../Services/db';
import { useLiveQuery } from 'dexie-react-hooks';
import prismClient from '../Services/prismClient';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContentText from '@mui/material/DialogContentText';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';

import GeneralNotificationComponent from './GeneralNotificationComponent';

// import styles from './AboutPage.module.css';

const KeyExchangeComponent: any = ({ open, setOpen }: any) => {
	const [encryptRecipientKey, setEncryptRecipientKey] = useState('');
	const [encrypted, setEncrypted] = useState('');
	const [decryptMessage, setDecryptMessage] = useState('');
	const [decrypted, setDecrypted] = useState('');

	const [boxPublicKey, setBoxPublickey]: any = useState('');
	const [identityPublicKey, setIdentityPublicKey]: any = useState('');
	const [copyBoxKeyNotify, setCopyBoxKeyNotify]: any = useState(false);
	const [copyEncryptedNotify, setCopyEncryptedNotify]: any = useState(false);
	const [copyDecryptedNotify, setCopyDecryptedNotify]: any = useState(false);

	useEffect(() => {
		(async function () {
			let identityKeyCheck: any = await db.general
				.where('name')
				.equals('IdentityKeys')
				.first();

			let boxKeysCheck: any = await db.general
				.where('name')
				.equals('BoxKeys')
				.first();

			if (boxKeysCheck !== undefined && identityKeyCheck !== undefined) {
				setBoxPublickey(boxKeysCheck.value.public);
				setIdentityPublicKey(identityKeyCheck.value.public);
			}
		})();
	});

	const boxEncrypt = async () => {
		let boxKeysQuery: any = await db.general
			.where('name')
			.equals('BoxKeys')
			.first();

		const prism: any = await prismClient.init(
			boxKeysQuery.value.public,
			boxKeysQuery.value.private
		);

		const encrypted = prism.boxEncrypt(identityPublicKey, encryptRecipientKey);

		setEncrypted(
			`${boxKeysQuery.value.public}:${encrypted.nonce}:${encrypted.cypherText}`
		);
	};

	const boxDecrypt = async () => {
		let boxKeysQuery: any = await db.general
			.where('name')
			.equals('BoxKeys')
			.first();

		const prism: any = await prismClient.init(
			boxKeysQuery.value.public,
			boxKeysQuery.value.private
		);

		const [decryptSenderKey, nonce, cypherText] = decryptMessage.split(':');
		const decrypted = prism.boxDecrypt(cypherText, nonce, decryptSenderKey);

		setDecrypted(decrypted);
	};

	return (
		<div className="BoxDialogueComponent">
			<Dialog open={open}>
				<DialogTitle>Box Encrypt</DialogTitle>
				<DialogContent>
					<Box
						sx={{
							marginBottom: '20px',
							'&:hover': {
								cursor: 'copy',
							},
						}}
						onClick={() => {
							navigator.clipboard.writeText(boxPublicKey || '');
							setCopyBoxKeyNotify(true);
						}}
					>
						{boxPublicKey}
					</Box>
					<Box sx={{ margin: '10px', minWidth: '500px' }}>
						<Grid container spacing={2}>
							<Grid item xs={6}>
								<Box sx={{ marginBottom: '10px' }}>
									<div>
										<b>Encrypt</b>
									</div>
								</Box>
								<Box sx={{ marginBottom: '10px' }}>
									<TextField
										label="Recipient Public Box Key"
										fullWidth
										variant="outlined"
										size="small"
										value={encryptRecipientKey}
										onChange={(event: any) => {
											setEncryptRecipientKey(event.target.value);
										}}
									/>
								</Box>
								<Box sx={{ marginBottom: '10px' }}>
									<Button
										fullWidth
										variant="contained"
										onClick={() => {
											boxEncrypt();
										}}
									>
										Generate
									</Button>
								</Box>
								<Box
									sx={{
										marginBottom: '10px',
										padding: '10px',
										border: '1px solid lightGrey',
										height: '100px',
										borderRadius: '10px',
										overflow: 'scroll',
										'&:hover': {
											cursor: 'copy',
										},
									}}
									onClick={() => {
										navigator.clipboard.writeText(encrypted || '');
										setCopyEncryptedNotify(true);
									}}
								>
									{encrypted}
								</Box>
							</Grid>
							<Grid item xs={6}>
								<Box sx={{ marginBottom: '10px' }}>
									<div>
										<b>Decrypt</b>
									</div>
								</Box>

								<Box sx={{ marginBottom: '10px' }}>
									<TextField
										label="Cypher Text"
										fullWidth
										variant="outlined"
										size="small"
										value={decryptMessage}
										onChange={(event: any) => {
											setDecryptMessage(event.target.value);
										}}
									/>
								</Box>
								<Box sx={{ marginBottom: '10px' }}>
									<Button
										fullWidth
										variant="contained"
										onClick={() => {
											boxDecrypt();
										}}
									>
										Decrypt
									</Button>
								</Box>
								<Box
									sx={{
										marginBottom: '10px',
										padding: '10px',
										border: '1px solid lightGrey',
										height: '100px',
										borderRadius: '10px',
										overflow: 'scroll',
										'&:hover': {
											cursor: 'copy',
										},
									}}
									onClick={() => {
										navigator.clipboard.writeText(decrypted || '');
										setCopyDecryptedNotify(true);
									}}
								>
									{decrypted}
								</Box>
							</Grid>
						</Grid>
					</Box>
				</DialogContent>
				<DialogActions>
					<Button
						color="error"
						onClick={() => {
							setOpen(false);
							setEncryptRecipientKey('');
							setEncrypted('');
							setDecryptMessage('');
							setDecrypted('');
						}}
					>
						Cancel
					</Button>
				</DialogActions>
			</Dialog>

			<GeneralNotificationComponent
				type="success"
				message="Your Public Box Key was coppiced!"
				open={copyBoxKeyNotify}
				setOpen={setCopyBoxKeyNotify}
			/>

			<GeneralNotificationComponent
				type="success"
				message="Encrypted box string copied!"
				open={copyEncryptedNotify}
				setOpen={setCopyEncryptedNotify}
			/>

			<GeneralNotificationComponent
				type="success"
				message="Decrypted box string copied!"
				open={copyDecryptedNotify}
				setOpen={setCopyDecryptedNotify}
			/>
		</div>
	);
};

export default KeyExchangeComponent;
