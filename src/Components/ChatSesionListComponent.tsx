import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../Services/db';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import ChatIcon from '@mui/icons-material/Chat';

import GeneralNotificationComponent from './GeneralNotificationComponent';

// import styles from './AboutPage.module.css';

const ChatSessionListComponent: any = ({
	selectedChat,
	setSelectedChat,
}: any) => {
	const [errorChat, setErrorChat] = useState(false);

	const chats: any = useLiveQuery(async () => {
		return await db.chat.toArray();
	});

	useEffect(() => {});

	const selectChat = (pubkey: any) => {
		chats.forEach((chat: any) => {
			if (chat.pubkey === pubkey) {
				if (chat.receiveKey) {
					setSelectedChat(chat);
				} else {
					setErrorChat(true);
				}
			}
		});
	};

	return (
		<div className="ChatSessionListComponent">
			<Box justifyContent="flex-end" alignItems="flex-end">
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
							<ListItemText
								primary={chat.name.substring(0, 20)}
								secondary={!chat.receiveKey && 'Requested'}
							/>
						</ListItemButton>
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
