import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../Services/db';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';

import ChatSessionListComponent from '../Components/ChatSesionListComponent';
import ChatWindowComponent from '../Components/ChatWindowComponent';

// import styles from './HomePage.module.css';

const HomePage: any = () => {
	const [selectedChat, setSelectedChat]: any = useState(null);
	const [tab, setTab]: any = useState('chat');

	useLiveQuery(async () => {
		let chatQuery = await db.chat.toArray();
		setSelectedChat(chatQuery[0]);
		return chatQuery;
	});

	// Use Effect hook
	useEffect(() => {
		(async function () {})();
	}, []);

	const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
		setTab(newValue);
	};

	return (
		<div className="HomePage">
			<Grid container spacing={0}>
				<Grid item xs={3}>
					<Box
						sx={{
							width: '100%',
							height: 'calc(100vh - 64px)',
							borderRight: '1px solid LightGrey',
							overflow: 'auto',
						}}
						justifyContent="flex-end"
						alignItems="flex-end"
					>
						<TabContext value={tab}>
							<TabList
								variant="fullWidth"
								onChange={handleTabChange}
								aria-label="lab API tabs example"
							>
								<Tab label="Chats" value="chat" />
								<Tab label="Requests" value="request" />
							</TabList>
							<TabPanel
								value="chat"
								sx={{
									padding: '10px 0px 0px 0px',
								}}
							>
								<ChatSessionListComponent
									selectedChat={selectedChat}
									setSelectedChat={setSelectedChat}
								/>
							</TabPanel>
							<TabPanel
								value="request"
								sx={{
									padding: '10px 0px 0px 0px',
								}}
							>
								Requests
							</TabPanel>
						</TabContext>
					</Box>
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
