import Grid from '@mui/material/Grid';

import ChatSessionListComponent from '../Components/ChatSesionListComponent';
import ChatWindowComponent from '../Components/ChatWindowComponent';

// import styles from './HomePage.module.css';

const HomePage: any = () => {
	return (
		<div className="HomePage">
			<Grid container spacing={0}>
				<Grid item xs={3}>
					<ChatSessionListComponent />
				</Grid>
				<Grid item xs={9}>
					<ChatWindowComponent />
				</Grid>
			</Grid>
		</div>
	);
};

export default HomePage;
