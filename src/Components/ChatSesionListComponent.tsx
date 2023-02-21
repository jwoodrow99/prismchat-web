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
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import NewChatDialogueComponent from './NewChatDialogueComponent';

// import styles from './AboutPage.module.css';

const ChatSessionListComponent: any = ({
	selectedChat,
	setSelectedChat,
}: any) => {
	const [openNewChat, setOpenNewChat] = useState(false);

	const chats: any = useLiveQuery(async () => {
		return await db.chat.toArray();
	});

	useEffect(() => {});

	const selectChat = (pubkey: any) => {
		chats.forEach((chat: any) => {
			if (chat.pubkey === pubkey) {
				setSelectedChat(chat);
			}
		});
	};

	return (
		<div className="ChatSessionListComponent">
			<Box justifyContent="flex-end" alignItems="flex-end">
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
									{chat.name.substring(0, 15)}
								</Typography>
							</ListItemText>
						</ListItemButton>
					))}
				</List>
			</Box>

			<NewChatDialogueComponent open={openNewChat} setOpen={setOpenNewChat} />
		</div>
	);
};

export default ChatSessionListComponent;
