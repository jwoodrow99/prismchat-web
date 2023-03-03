import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../Services/db';
import api from '../Services/api';
import prismClient from '../Services/prismClient';

import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

import SendIcon from '@mui/icons-material/Send';

// import styles from './AboutPage.module.css';

const ChatWindowComponent: any = ({ selectedChat, setSelectedChat }: any) => {
	const [newMessageText, setNewMessageText] = useState('');
	const [chatMessages, setChatMessages]: any = useState([]);

	useLiveQuery(async () => {
		if (selectedChat) {
			const messageQuery: any = await db.message
				.where('pubkey')
				.equals(selectedChat.pubkey)
				.limit(50)
				.offset(0)
				.reverse()
				.sortBy('date');

			setChatMessages(messageQuery.reverse());
		}
	}, [selectedChat]);

	useEffect(() => {
		scrollToBottom();
	});

	const sendMessage = async (message: any) => {
		const prism: any = await prismClient.init();

		// Update chat to increase count and modify send key
		let derivedSenKey = prism.sessionKeyDerivation(
			selectedChat.sendKey,
			selectedChat.sendCount + 1
		);
		await db.chat.update(selectedChat.pubkey, {
			sendCount: selectedChat.sendCount + 1,
		});

		// Perform Encryption
		let layer1Up = prism.prismEncrypt_Layer1(
			{
				message: message,
			},
			derivedSenKey
		);
		let layer2Up = prism.prismEncrypt_Layer2(
			'M',
			selectedChat.sendCount + 1,
			layer1Up.nonce,
			layer1Up.cypherText,
			selectedChat.pubkey
		);
		let layer3Up = prism.prismEncrypt_Layer3(
			layer2Up.nonce,
			layer2Up.cypherText
		);
		let encryptedData = prism.prismEncrypt_Layer4(
			layer3Up.key,
			layer3Up.nonce,
			layer3Up.cypherText,
			selectedChat.pubkey
		);

		// Send and save Message
		await api.post('/message', {
			to: selectedChat.pubkey,
			data: encryptedData,
		});

		await db.message.add({
			pubkey: selectedChat.pubkey,
			date: Date.now(),
			type: 'M',
			data: message,
			sent: true,
		});

		let updatedChatRecord: any = await db.chat
			.where('pubkey')
			.equals(selectedChat.pubkey)
			.first();

		console.log('New Message Sent: ', {
			to: selectedChat.pubkey,
			message: message,
			encryptedData: encryptedData,
		});

		setSelectedChat(updatedChatRecord);
	};

	const scrollToBottom = () => {
		let scrollingElement: any = document.querySelector('#messageBody');
		scrollingElement.scrollTop = scrollingElement.scrollHeight;
	};

	return (
		<div className="ChatWindowComponent">
			<Grid container spacing={0}>
				{/* Show messages */}
				<Grid item xs={12}>
					<Box
						id="messageBody"
						sx={{
							width: '100%',
							height: 'calc(100vh - 40px - 64px)',
							overflow: 'auto',
						}}
						justifyContent="flex-end"
						alignItems="flex-end"
					>
						<Stack
							sx={{
								width: '100%',
								overflowY: 'hidden',
							}}
							justifyContent="flex-end"
						>
							{chatMessages?.map((message: any) => {
								if (message.sent) {
									return (
										<Box
											key={message.id}
											sx={{
												backgroundColor: 'DodgerBlue',
												color: 'white',
												borderRadius: '10px',
												margin: '5px 10px 5px 100px',
												padding: '12px 30px',
												width: 'auto',
											}}
										>
											{message.data}
										</Box>
									);
								} else {
									return (
										<Box
											key={message.id}
											sx={{
												backgroundColor: 'Gainsboro',
												color: 'black',
												borderRadius: '10px',
												margin: '5px 100px 5px 10px',
												padding: '10px 30px',
											}}
										>
											{message.data}
										</Box>
									);
								}
							})}
						</Stack>
					</Box>
				</Grid>

				{/* Message sending */}
				<Grid item xs={12}>
					<Box
						sx={{
							width: '100%',
							height: '40px',
							display: 'flex',
							justifyContent: 'center',
						}}
					>
						<Grid container spacing={0}>
							<Grid item xs={9} md={10}>
								<TextField
									fullWidth
									variant="outlined"
									size="small"
									value={newMessageText}
									onKeyPress={(event) => {
										if (event.key === 'Enter') {
											sendMessage(newMessageText);
											setNewMessageText('');
										}
									}}
									onChange={(event: any) => {
										setNewMessageText(event.target.value);
									}}
								/>
							</Grid>
							<Grid item xs={3} md={2}>
								<Button
									fullWidth
									variant="contained"
									onClick={() => {
										sendMessage(newMessageText);
										setNewMessageText('');
									}}
								>
									<SendIcon />
								</Button>
							</Grid>
						</Grid>
					</Box>
				</Grid>
			</Grid>
		</div>
	);
};

export default ChatWindowComponent;
