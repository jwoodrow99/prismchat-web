import { useEffect, useState } from 'react';
import { Prism } from 'prismchat-lib';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../Services/db';
import api from '../Services/api';

import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

// import styles from './AboutPage.module.css';

const ChatWindowComponent: any = ({ selectedChat, setSelectedChat }: any) => {
	const [newMessageText, setNewMessageText] = useState('');
	const [chatMessages, setChatMessages] = useState([]);

	useLiveQuery(async () => {
		if (selectedChat) {
			let messageQuery: any = await db.message
				.where('pubkey')
				.equals(selectedChat.pubkey)
				.limit(50)
				.offset(0)
				.reverse()
				.sortBy('date');
			setChatMessages(messageQuery.reverse());
		}
	});

	useEffect(() => {
		(async function () {
			if (selectedChat) {
				let messageQuery: any = await db.message
					.where('pubkey')
					.equals(selectedChat.pubkey)
					.limit(50)
					.offset(0)
					.reverse()
					.sortBy('date');
				setChatMessages(messageQuery.reverse());
			}
		})();
	}, [selectedChat]);

	const sendMessage = async (message: any) => {
		const identityKeysCheck: any = await db.general
			.where('name')
			.equals('IdentityKeys')
			.first();
		const prism: any = new Prism(
			identityKeysCheck.value.public,
			identityKeysCheck.value.private
		);
		await prism.init();
		console.log(`New Message: ${message}`);

		// Perform Encryption
		let layer1Up = prism.prismEncrypt_Layer1(
			{
				message: message,
			},
			selectedChat.sendKey
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

		console.log(encryptedData);

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

		// Update chat to increase count and modify send key
		let derivedSenKey = prism.sessionKeyDerivation(
			selectedChat.sendKey,
			selectedChat.sendCount + 1
		);
		await db.chat.update(selectedChat.pubkey, {
			sendCount: selectedChat.sendCount + 1,
			sendKey: derivedSenKey,
		});

		let updatedChatRecord: any = await db.chat
			.where('pubkey')
			.equals(selectedChat.pubkey)
			.first();
		setSelectedChat(updatedChatRecord);
	};

	return (
		<div className="ChatWindowComponent">
			<Grid container spacing={0}>
				{/* Show messages */}
				<Grid item xs={12}>
					{/* <Box
						sx={{
							width: '100%',
							height: '90vh',
							outline: '1px solid grey',
						}}
						justifyContent="flex-end"
						alignItems="flex-end"
					> */}
					<Stack
						sx={{
							width: '100%',
							height: '90vh',
							outline: '1px solid grey',
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
											margin: '0px 10px 10px 100px',
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
											margin: '0px 100px 10px 10px',
											padding: '10px 30px',
										}}
									>
										{message.data}
									</Box>
								);
							}
						})}
					</Stack>
					{/* </Box> */}
				</Grid>

				{/* Message sending */}
				<Grid item xs={12}>
					<Box
						sx={{
							width: '100%',
							height: '10vh',
							outline: '1px solid grey',
							display: 'flex',
							justifyContent: 'center',
						}}
					>
						<Grid container spacing={0}>
							<Grid item xs={10}>
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
							<Grid item xs={2}>
								<Button
									fullWidth
									variant="contained"
									onClick={() => {
										sendMessage(newMessageText);
										setNewMessageText('');
									}}
								>
									Send
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
