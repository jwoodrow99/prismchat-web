import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../Services/db';

import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import Drawer from '@mui/material/Drawer';

import ChatSessionListComponent from '../Components/ChatSesionListComponent';
import ChatRequestListComponent from '../Components/ChatRequestListComponent';
import ChatWindowComponent from '../Components/ChatWindowComponent';
import NewChatDialogueComponent from '../Components/NewChatDialogueComponent';
import KeyExchangeComponent from '../Components/KeyExchangeComponent';

// import styles from './HomePage.module.css';

const HomePage: any = ({ drawerOpen, setDrawerOpen }: any) => {
	const [selectedChat, setSelectedChat]: any = useState(null);
	const [tab, setTab]: any = useState('chat');
	const [openNewChat, setOpenNewChat] = useState(false);
	const [openBoxEncrypt, setOpenBoxEncrypt] = useState(false);

	useLiveQuery(async () => {
		const chatQuery = await db.chat.toArray();
		if (selectedChat == null) {
			setSelectedChat(chatQuery[0]);
		}
	}, [selectedChat]);

	// Use Effect hook
	useEffect(() => {
		(async function () {})();
	}, [selectedChat]);

	return (
		<div className="HomePage">
			<Grid container spacing={0}>
				<Drawer
					open={drawerOpen}
					onClose={() => {
						setDrawerOpen(false);
					}}
					sx={{
						display: { xs: 'block', sm: 'none', md: 'none' },
					}}
				>
					<Box
						sx={{
							width: '60vw',
							height: 'calc(100vh - 64px)',
							borderRight: '1px solid LightGrey',
							overflow: 'auto',
						}}
						justifyContent="flex-end"
						alignItems="flex-end"
					>
						<Box
							sx={{
								padding: '10px 10px 0px 10px',
							}}
						>
							<Button
								fullWidth
								variant="contained"
								onClick={() => {
									setOpenNewChat(true);
								}}
							>
								New Chat
							</Button>
						</Box>
						<Box
							sx={{
								padding: '10px 10px 0px 10px',
							}}
						>
							<Button
								fullWidth
								variant="contained"
								onClick={() => {
									setOpenBoxEncrypt(true);
								}}
							>
								Key Exchange
							</Button>
						</Box>
						<TabContext value={tab}>
							<TabList
								variant="fullWidth"
								onChange={(event: React.SyntheticEvent, newValue: string) => {
									setTab(newValue);
								}}
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
									setDrawerOpen={setDrawerOpen}
								/>
							</TabPanel>
							<TabPanel
								value="request"
								sx={{
									padding: '10px 0px 0px 0px',
								}}
							>
								<ChatRequestListComponent
									selectedChat={selectedChat}
									setSelectedChat={setSelectedChat}
								/>
							</TabPanel>
						</TabContext>
					</Box>
				</Drawer>

				<Grid
					item
					xs={3}
					sx={{ display: { xs: 'none', sm: 'block', md: 'block' } }}
				>
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
						<Box
							sx={{
								padding: '10px 10px 0px 10px',
							}}
						>
							<Button
								fullWidth
								variant="contained"
								onClick={() => {
									setOpenNewChat(true);
								}}
							>
								New Chat
							</Button>
						</Box>
						<Box
							sx={{
								padding: '10px 10px 0px 10px',
							}}
						>
							<Button
								fullWidth
								variant="contained"
								onClick={() => {
									setOpenBoxEncrypt(true);
								}}
							>
								Key Exchange
							</Button>
						</Box>
						<TabContext value={tab}>
							<TabList
								variant="fullWidth"
								onChange={(event: React.SyntheticEvent, newValue: string) => {
									setTab(newValue);
								}}
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
								<ChatRequestListComponent
									selectedChat={selectedChat}
									setSelectedChat={setSelectedChat}
								/>
							</TabPanel>
						</TabContext>
					</Box>
				</Grid>
				<Grid item xs={12} md={9}>
					<ChatWindowComponent
						selectedChat={selectedChat}
						setSelectedChat={setSelectedChat}
					/>
				</Grid>
			</Grid>

			<NewChatDialogueComponent open={openNewChat} setOpen={setOpenNewChat} />
			<KeyExchangeComponent open={openBoxEncrypt} setOpen={setOpenBoxEncrypt} />
		</div>
	);
};

export default HomePage;
