import { useEffect } from 'react'; // useEffect, useState

import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

// import styles from './AboutPage.module.css';

const GeneralNotificationComponent: any = ({
	type,
	message,
	open,
	setOpen,
}: any) => {
	// Type: error, warning, info, success

	// const [open, setOpen] = useState(false);
	useEffect(() => {});

	return (
		<div className="GeneralNotificationComponent">
			<Snackbar
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
				open={open}
				onClose={() => {
					setOpen(false);
				}}
				autoHideDuration={5000}
			>
				<Alert
					onClose={() => {
						setOpen(false);
					}}
					severity={type}
				>
					{message}
				</Alert>
			</Snackbar>
		</div>
	);
};

export default GeneralNotificationComponent;
