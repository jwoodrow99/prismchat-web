import { useEffect, useState } from 'react';
import { db } from '../Services/db';

import Grid from '@mui/material/Grid';

import ChatSessionListComponent from '../Components/ChatSesionListComponent';
import ChatWindowComponent from '../Components/ChatWindowComponent';

// import styles from './HomePage.module.css';

const HomePage: any = () => {
	const [selectedChat, setSelectedChat] = useState(null);
	const [chats, setChats]: any = useState([]);

	useEffect(() => {
		(async function () {
			let chatsQuery: any = await db.chat.toArray();
			setChats(chatsQuery);
			setSelectedChat(chatsQuery[0]);
		})();
	}, []);

	return (
		<div className="HomePage">
			<Grid container spacing={0}>
				<Grid item xs={3}>
					<ChatSessionListComponent
						selectedChat={selectedChat}
						setSelectedChat={setSelectedChat}
						chats={chats}
						setChats={setChats}
					/>
				</Grid>
				<Grid item xs={9}>
					<ChatWindowComponent
						selectedChat={selectedChat}
						setSelectedChat={setSelectedChat}
					/>
				</Grid>
			</Grid>
		</div>
	);
};

export default HomePage;
