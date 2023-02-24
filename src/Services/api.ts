import axios from 'axios';

const axiosClient = axios.create({
	baseURL: process.env.REACT_APP_API,
	timeout: 10000,
	headers: {
		Authorization: `Bearer ${localStorage.getItem('access_token')}`,
	},
});

axiosClient.interceptors.request.use((config: any): any => {
	let newConfig = config;
	newConfig['Authorization'] = `Bearer ${localStorage.getItem('access_token')}`;
	return newConfig;
});

export default axiosClient;
