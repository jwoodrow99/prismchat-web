import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../Services/db';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';

import ChatSessionListComponent from '../Components/ChatSesionListComponent';
import ChatWindowComponent from '../Components/ChatWindowComponent';

// import styles from './HomePage.module.css';

const HomePage: any = () => {
	const [selectedChat, setSelectedChat]: any = useState(null);

	useLiveQuery(async () => {
		let chatQuery = await db.chat.toArray();
		setSelectedChat(chatQuery[0]);
		return chatQuery;
	});

	// Use Effect hook
	useEffect(() => {
		(async function () {})();
	}, []);

	return (
		<div className="HomePage">
			<Grid container spacing={0}>
				<Grid item xs={3}>
					<ChatSessionListComponent
						selectedChat={selectedChat}
						setSelectedChat={setSelectedChat}
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
