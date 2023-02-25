import axios from 'axios';

const axiosClient = axios.create({
	baseURL: process.env.REACT_APP_API,
	timeout: 10000,
});

axiosClient.interceptors.request.use((config: any): any => {
	let newConfig = config;
	const access_token = localStorage.getItem('access_token');
	if (access_token !== null) {
		newConfig.headers['Authorization'] = `Bearer ${access_token}`;
	}
	return newConfig;
});

export default axiosClient;
