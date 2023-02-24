import { db } from '../Services/db';
import api from '../Services/api';
import { Prism } from 'prismchat-lib';

const init = async () => {
	let identityKeys: any = await db.general
		.where('name')
		.equals('IdentityKeys')
		.first();

	if (identityKeys !== undefined) {
		const prism: any = new Prism(
			identityKeys.value.public,
			identityKeys.value.private
		);
		await prism.init();

		// Request auth
		api
			.post('/auth/request', {
				pubkey: identityKeys.value.public,
			})
			.then((response: any) => {
				let verificationString = response.data.verificationString;
				let serverPublicKey = response.data.serverPublicKey;

				const authBox = prism.boxEncrypt(
					{
						verificationString: verificationString,
					},
					serverPublicKey
				);

				// Send auth response
				api
					.post('/auth/verify', {
						pubkey: identityKeys.value.public,
						cypher: authBox.cypherText,
						nonce: authBox.nonce,
					})
					.then((response: any) => {
						console.log(`Access token: ${response.data.access_token}`);
						localStorage.setItem('access_token', response.data.access_token);
					});
			});
	}
};

const exportVal: any = {
	init: init,
};

export default exportVal;
