import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../Services/db';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import ChatIcon from '@mui/icons-material/Chat';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';

import GeneralNotificationComponent from './GeneralNotificationComponent';

// import styles from './AboutPage.module.css';

const ChatSessionListComponent: any = ({
	selectedChat,
	setSelectedChat,
	setDrawerOpen,
}: any) => {
	const [errorChat, setErrorChat] = useState(false);
	const [chats, setChats]: any = useState([]);

	useLiveQuery(async () => {
		const chatQuery: any = await db.chat.toArray();
		const chatsTest = chatQuery.map((chat: any) => {
			if (selectedChat !== null) {
				if (selectedChat.pubkey === chat.pubkey) {
					chat.newMessage = false;
				}
			}
			return chat;
		});

		setChats(chatsTest);
	});

	useEffect(() => {
		if (selectedChat) {
			db.chat.update(selectedChat.pubkey, {
				newMessage: false,
			});
		}
	});

	const selectChat = (pubkey: any) => {
		chats.forEach(async (chat: any) => {
			if (chat.pubkey === pubkey) {
				if (chat.receiveKey) {
					setSelectedChat(chat);
					await db.chat.update(pubkey, {
						newMessage: false,
					});
				} else {
					setErrorChat(true);
				}
			}
		});
		setDrawerOpen(false);
	};

	const deleteChat = async (pubkey: any) => {
		await db.chat.where('pubkey').equals(pubkey).delete();
		await db.message.where('pubkey').equals(pubkey).delete();
	};

	return (
		<div className="ChatSessionListComponent">
			<Box justifyContent="flex-end" alignItems="flex-end">
				<List dense={true}>
					{chats?.map((chat: any) => (
						<ListItem
							selected={selectedChat.pubkey === chat.pubkey ? true : false}
							key={chat.pubkey}
							secondaryAction={
								<IconButton
									onClick={() => {
										deleteChat(chat.pubkey);
									}}
								>
									<DeleteIcon />
								</IconButton>
							}
						>
							<ListItemButton
								onClick={() => {
									selectChat(chat.pubkey);
								}}
							>
								<ListItemAvatar>
									<Avatar>
										<ChatIcon />
									</Avatar>
								</ListItemAvatar>

								{chat.newMessage && (
									<Badge color="primary" variant="dot">
										<ListItemText
											primary={chat.name.substring(0, 20)}
											secondary={!chat.receiveKey && 'Requested'}
										/>
									</Badge>
								)}

								{!chat.newMessage && (
									<ListItemText
										primary={chat.name.substring(0, 20)}
										secondary={!chat.receiveKey && 'Requested'}
									/>
								)}
							</ListItemButton>
						</ListItem>
					))}
				</List>
			</Box>

			<GeneralNotificationComponent
				type="error"
				message="Chat request has not been accepted yet."
				open={errorChat}
				setOpen={setErrorChat}
			/>
		</div>
	);
};

export default ChatSessionListComponent;
