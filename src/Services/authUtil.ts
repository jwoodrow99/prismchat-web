import { db } from '../Services/db';
import api from '../Services/api';
import prismClient from './prismClient';

const request = async () => {
	const prism: any = await prismClient.init();

	const response = await api.post('/auth/request', {
		pubkey: prism.IdentityKeys.public,
	});

	let verificationString = response.data.verificationString;
	let serverPublicKey = response.data.serverPublicKey;

	const authBox = prism.boxEncrypt(
		{
			verificationString: verificationString,
		},
		serverPublicKey
	);

	return {
		cypherText: authBox.cypherText,
		nonce: authBox.nonce,
	};
};

const verify = async (cypherText: any, nonce: any) => {
	const prism: any = await prismClient.init();

	const response = await api.post('/auth/verify', {
		pubkey: prism.IdentityKeys.public,
		cypher: cypherText,
		nonce: nonce,
	});

	return response.data.access_token;
};

const exportVal: any = {
	request: request,
	verify: verify,
};

export default exportVal;
