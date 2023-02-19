import axios from 'axios';

const axiosClient = axios.create({
	baseURL: 'http://localhost/api/',
	timeout: 10000,
});

export default axiosClient;
