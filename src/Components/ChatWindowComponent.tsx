import { useEffect, useState } from 'react';

import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

// import styles from './AboutPage.module.css';

const ChatWindowComponent: any = () => {
	const [message, setMessage] = useState('');

	return (
		<div className="ChatWindowComponent">
			<Grid container spacing={0}>
				<Grid item xs={12}>
					<Box
						sx={{
							width: '100%',
							height: '90vh',
							outline: '1px solid grey',
						}}
					></Box>
				</Grid>
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
									value={message}
									onChange={(event: any) => {
										setMessage(event.target.value);
									}}
								/>
							</Grid>
							<Grid item xs={2}>
								<Button
									fullWidth
									variant="contained"
									onClick={() => {
										console.log(message);
										setMessage('');
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
