import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import api from '../Services/api';
import { db } from '../Services/db';
import prismClient from '../Services/prismClient';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import ChatIcon from '@mui/icons-material/Chat';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';

// import styles from './AboutPage.module.css';

const ChatRequestListComponent: any = ({
	selectedChat,
	setSelectedChat,
}: any) => {
	const [selectedRequest, setSelectedRequest]: any = useState(null);
	const [openRequestDialogue, setOpenRequestDialogue]: any = useState(false);
	const [requestChatName, setRequestChatName]: any = useState('');

	useEffect(() => {});

	const requests: any = useLiveQuery(async () => {
		return await db.request.toArray();
	});

	const selectRequest = (request: any) => {
		setSelectedRequest(request);
		setOpenRequestDialogue(true);
	};

	const acceptRequest = async () => {
		const prism: any = await prismClient.init();

		// Generate session keys
		const sessionMasterKeys: any = prism.generateSessionKeys();
		const { sendKey, receiveKey } = prism.generateSharedSessionKeysInitial(
			sessionMasterKeys.publicKey,
			sessionMasterKeys.privateKey,
			selectedRequest.receivedPublic
		);

		await db.chat.add({
			name: requestChatName,
			pubkey: selectedRequest.pubkey,
			masterPublic: sessionMasterKeys.publicKey,
			masterPrivate: sessionMasterKeys.privateKey,
			sendCount: 0,
			sendKey: sendKey,
			receiveKey: receiveKey,
			newMessage: false,
		});

		// Send RC
		let layer2Up = prism.prismEncrypt_Layer2(
			'RC',
			0,
			null,
			sessionMasterKeys.publicKey,
			selectedRequest.pubkey
		);
		let layer3Up = prism.prismEncrypt_Layer3(
			layer2Up.nonce,
			layer2Up.cypherText
		);
		let encryptedData = prism.prismEncrypt_Layer4(
			layer3Up.key,
			layer3Up.nonce,
			layer3Up.cypherText,
			selectedRequest.pubkey
		);

		await db.request.delete(selectedRequest.pubkey);

		await api.post('/message', {
			to: selectedRequest.pubkey,
			data: encryptedData,
		});

		setSelectedRequest(null);
		setRequestChatName('');
		setOpenRequestDialogue(false);
	};

	const declineRequest = async () => {
		await db.request.delete(selectedRequest.pubkey);
		setSelectedRequest(null);
		setRequestChatName('');
		setOpenRequestDialogue(false);
	};

	return (
		<div className="ChatRequestListComponent">
			<Box justifyContent="flex-end" alignItems="flex-end">
				<List dense={true}>
					{requests?.map((request: any) => (
						<ListItemButton
							key={request.pubkey}
							onClick={() => {
								selectRequest(request);
							}}
						>
							<ListItemAvatar>
								<Avatar>
									<ChatIcon />
								</Avatar>
							</ListItemAvatar>
							<ListItemText primary={request.pubkey.substring(0, 20) + '...'} />
						</ListItemButton>
					))}
				</List>
			</Box>

			{/* Request action dialogue */}
			<Dialog open={openRequestDialogue}>
				<DialogTitle>New Chat</DialogTitle>
				<DialogContent>
					<Box sx={{ margin: '10px', minWidth: '30vw' }}>
						<TextField
							label="Chat Nickname"
							fullWidth
							variant="outlined"
							size="small"
							value={requestChatName}
							onChange={(event: any) => {
								setRequestChatName(event.target.value);
							}}
						/>
					</Box>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={() => {
							acceptRequest();
						}}
					>
						Accept
					</Button>
					<Button
						color="error"
						onClick={() => {
							declineRequest();
						}}
					>
						Decline
					</Button>
					<Button
						color="error"
						onClick={() => {
							setSelectedRequest(null);
							setRequestChatName('');
							setOpenRequestDialogue(false);
						}}
					>
						Cancel
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
};

export default ChatRequestListComponent;
