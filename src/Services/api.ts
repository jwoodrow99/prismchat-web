import axios from 'axios';

const axiosClient = axios.create({
	baseURL: process.env.REACT_APP_API,
	timeout: 10000,
});

export default axiosClient;
