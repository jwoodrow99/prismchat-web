import { useEffect, useState } from 'react';
import prismClient from '../Services/prismClient';
import QRCode from 'qrcode';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
// import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

// import styles from './AboutPage.module.css';

const QrDialogueComponent: any = ({ open, setOpen }: any) => {
	const [qrUri, setQrUri] = useState('');

	useEffect(() => {
		(async function () {
			const prism: any = await prismClient.init();
			setQrUri(
				await QRCode.toDataURL(prism.IdentityKeys.public, {
					width: 1000,
				})
			);
		})();
	});

	return (
		<div className="QrDialogueComponent">
			<Dialog open={open}>
				{/* <DialogTitle>QR Code</DialogTitle> */}
				<DialogContent>
					<Box
						sx={{
							maxWidth: '200px',
						}}
					>
						<img src={qrUri} alt="Generated QR Public Identity key." />
					</Box>
				</DialogContent>
				<DialogActions>
					<Button
						color="error"
						onClick={() => {
							setOpen(false);
						}}
					>
						Close
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
};

export default QrDialogueComponent;
