import { useEffect, useState } from 'react';
import api from '../Services/api';
import { db } from '../Services/db';
import prismClient from '../Services/prismClient';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

// import styles from './AboutPage.module.css';

const NewChatDialogueComponent: any = ({ open, setOpen }: any) => {
	const [newChatRecipient, setNewChatRecipient] = useState('');
	const [newChatName, setNewChatName] = useState('');

	useEffect(() => {});

	const startNewChat = async (recipientPublicKey: string) => {
		const prism: any = await prismClient.init();

		const sessionMasterKeys: any = prism.generateSessionKeys();

		await db.chat.add({
			name: newChatName,
			pubkey: recipientPublicKey,
			masterPublic: sessionMasterKeys.publicKey,
			masterPrivate: sessionMasterKeys.privateKey,
			sendCount: 0,
			sendKey: '',
			receiveKey: '',
		});

		let layer2Up = prism.prismEncrypt_Layer2(
			'IC',
			0,
			null,
			sessionMasterKeys.publicKey,
			recipientPublicKey
		);
		let layer3Up = prism.prismEncrypt_Layer3(
			layer2Up.nonce,
			layer2Up.cypherText
		);
		let encryptedData = prism.prismEncrypt_Layer4(
			layer3Up.key,
			layer3Up.nonce,
			layer3Up.cypherText,
			recipientPublicKey
		);

		await api.post('/message', {
			to: recipientPublicKey,
			data: encryptedData,
		});
	};

	return (
		<div className="NewChatDialogueComponent">
			<Dialog open={open}>
				<DialogTitle>New Chat</DialogTitle>
				<DialogContent>
					<Box sx={{ margin: '10px', minWidth: '30vw' }}>
						<TextField
							label="Recipient Public Identity Key"
							fullWidth
							variant="outlined"
							size="small"
							value={newChatRecipient}
							onKeyPress={(event: any) => {
								if (event.key === 'Enter') {
									setNewChatRecipient(event.target.value);
								}
							}}
							onChange={(event: any) => {
								setNewChatRecipient(event.target.value);
							}}
						/>
					</Box>

					<Box sx={{ margin: '10px', minWidth: '30vw' }}>
						<TextField
							label="Chat Nickname"
							fullWidth
							variant="outlined"
							size="small"
							value={newChatName}
							onKeyPress={(event: any) => {
								if (event.key === 'Enter') {
									setNewChatName(event.target.value);
								}
							}}
							onChange={(event: any) => {
								setNewChatName(event.target.value);
							}}
						/>
					</Box>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={() => {
							startNewChat(newChatRecipient);
							setOpen(false);
							setNewChatRecipient('');
							setNewChatName('');
						}}
					>
						Agree
					</Button>
					<Button
						color="error"
						onClick={() => {
							setOpen(false);
							setNewChatRecipient('');
							setNewChatName('');
						}}
					>
						Cancel
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
};

export default NewChatDialogueComponent;
