import { useEffect, useState } from 'react';
import { Prism } from 'prismchat-lib';
import api from '../Services/api';
import { db } from '../Services/db';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import ChatIcon from '@mui/icons-material/Chat';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// import styles from './AboutPage.module.css';

const ChatSessionListComponent: any = ({
	selectedChat,
	setSelectedChat,
	chats,
	setChats,
}: any) => {
	const [openNewChat, setOpenNewChat] = useState(false);
	const [newChatRecipient, setNewChatRecipient] = useState('');

	useEffect(() => {});

	const startNewChat = async (recipientPublicKey: string) => {
		const identityKeysCheck: any = await db.general
			.where('name')
			.equals('IdentityKeys')
			.first();

		const prism: any = new Prism(
			identityKeysCheck.value.public,
			identityKeysCheck.value.private
		);

		await prism.init();

		const sessionMasterKeys: any = prism.generateSessionKeys();

		await db.chat.add({
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

	const selectChat = (pubkey: any) => {
		chats.forEach((chat: any) => {
			if (chat.pubkey === pubkey) {
				setSelectedChat(chat);
			}
		});
	};

	return (
		<div className="ChatSessionListComponent">
			<Button
				variant="contained"
				onClick={() => {
					setOpenNewChat(true);
				}}
			>
				New Chat
			</Button>

			<List dense={true}>
				{chats?.map((chat: any) => (
					<ListItemButton
						selected={selectedChat.pubkey === chat.pubkey ? true : false}
						key={chat.pubkey}
						onClick={() => {
							selectChat(chat.pubkey);
						}}
					>
						<ListItemAvatar>
							<Avatar>
								<ChatIcon />
							</Avatar>
						</ListItemAvatar>
						<ListItemText>
							<Typography sx={{ whiteSpace: 'normal' }}>
								{chat.pubkey.substring(0, 10) + '...'}
							</Typography>
						</ListItemText>
					</ListItemButton>
				))}
			</List>

			<Dialog open={openNewChat}>
				<DialogTitle>New Chat</DialogTitle>
				<DialogContent>
					<TextField
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
				</DialogContent>
				<DialogActions>
					<Button
						onClick={() => {
							startNewChat(newChatRecipient);
							setOpenNewChat(false);
						}}
					>
						Agree
					</Button>
					<Button
						color="error"
						onClick={() => {
							setOpenNewChat(false);
						}}
					>
						Cancel
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
};

export default ChatSessionListComponent;
