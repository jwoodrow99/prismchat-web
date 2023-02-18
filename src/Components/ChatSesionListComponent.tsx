import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import ChatIcon from '@mui/icons-material/Chat';

// import styles from './AboutPage.module.css';

const ChatSessionListComponent: any = () => {
	function generate(element: React.ReactElement) {
		return [0, 1, 2].map((value) =>
			React.cloneElement(element, {
				key: value,
			})
		);
	}

	return (
		<div className="ChatSessionListComponent">
			<List dense={true}>
				{generate(
					<ListItem>
						<ListItemAvatar>
							<Avatar>
								<ChatIcon />
							</Avatar>
						</ListItemAvatar>
						<ListItemText primary="Single-line item" />
						{/* secondary={secondary ? 'Secondary text' : null} */}
					</ListItem>
				)}
			</List>
		</div>
	);
};

export default ChatSessionListComponent;
