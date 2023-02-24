import { db } from '../Services/db';
import api from '../Services/api';
import { Prism } from 'prismchat-lib';

const pull = async () => {
	let identityKeys = await db.general
		.where('name')
		.equals('IdentityKeys')
		.first();

	if (
		identityKeys !== undefined &&
		localStorage.getItem('access_token') !== null
	) {
		const prism: any = new Prism(
			identityKeys.value.public,
			identityKeys.value.private
		);
		await prism.init();

		const newChats = await api.get('/message', {
			headers: {
				Authorization: `Bearer ${localStorage.getItem('access_token')}`,
			},
		});

		newChats.data.messages.forEach((message: any) => {
			// Layer 4 decrypt
			let layer4Down = prism.prismDecrypt_Layer4(message.message);
			let layer3Down = prism.prismDecrypt_Layer3(
				layer4Down.nonce,
				layer4Down.key,
				layer4Down.cypherText
			);
			let layer2Down = prism.prismDecrypt_Layer2(
				layer3Down.nonce,
				layer3Down.cypherText,
				layer3Down.from
			);

			switch (layer2Down.type) {
				case 'IC':
					processMessage_IC(layer3Down.from, layer2Down.cypherText);
					break;
				case 'RC':
					processMessage_RC(layer3Down.from, layer2Down.cypherText);
					break;
				case 'M':
					processMessage_M(layer3Down.from, layer2Down);
					break;
				default:
					processMessage_UNKNOWN(layer3Down.from);
			}
		});
	}
};

const processMessage_IC = async (from: string, data: any) => {
	await db.request.add({
		pubkey: from,
		receivedPublic: data,
	});

	// let identityKeys = await db.general
	// 	.where('name')
	// 	.equals('IdentityKeys')
	// 	.first();

	// if (identityKeys !== undefined) {
	// 	const prism: any = new Prism(
	// 		identityKeys.value.public,
	// 		identityKeys.value.private
	// 	);
	// 	await prism.init();

	// 	// Logic Here
	// 	// Generate session keys
	// 	const sessionMasterKeys: any = prism.generateSessionKeys();
	// 	const { sendKey, receiveKey } = prism.generateSharedSessionKeysInitial(
	// 		sessionMasterKeys.publicKey,
	// 		sessionMasterKeys.privateKey,
	// 		data
	// 	);
	// 	await db.request.add({
	// 		pubkey: from,
	// 		masterPublic: sessionMasterKeys.publicKey,
	// 		masterPrivate: sessionMasterKeys.privateKey,

	// 	});

	// 	// Send RC
	// 	let layer2Up = prism.prismEncrypt_Layer2(
	// 		'RC',
	// 		0,
	// 		null,
	// 		sessionMasterKeys.publicKey,
	// 		from
	// 	);
	// 	let layer3Up = prism.prismEncrypt_Layer3(
	// 		layer2Up.nonce,
	// 		layer2Up.cypherText
	// 	);
	// 	let encryptedData = prism.prismEncrypt_Layer4(
	// 		layer3Up.key,
	// 		layer3Up.nonce,
	// 		layer3Up.cypherText,
	// 		from
	// 	);

	// 	await api.post('/message', {
	// 		to: from,
	// 		data: encryptedData,
	// 	});
	// }
};

const processMessage_RC = async (from: string, data: any) => {
	let identityKeys = await db.general
		.where('name')
		.equals('IdentityKeys')
		.first();

	if (identityKeys !== undefined) {
		const prism: any = new Prism(
			identityKeys.value.public,
			identityKeys.value.private
		);
		await prism.init();

		// Logic Here
		let chatRecord: any = await db.chat.where('pubkey').equals(from).first();

		const { sendKey, receiveKey } = prism.generateSharedSessionKeysResponse(
			chatRecord.masterPublic,
			chatRecord.masterPrivate,
			data
		);

		await db.chat.update(from, {
			receiveKey: receiveKey,
			sendKey: sendKey,
		});
	}
};

const processMessage_M = async (from: string, data: any) => {
	let identityKeys = await db.general
		.where('name')
		.equals('IdentityKeys')
		.first();

	if (identityKeys !== undefined) {
		const prism: any = new Prism(
			identityKeys.value.public,
			identityKeys.value.private
		);
		await prism.init();

		// Logic Here
		let chatRecord: any = await db.chat.where('pubkey').equals(from).first();

		// Update chat to increase count and modify send key
		let derivedReceiveKey = prism.sessionKeyDerivation(
			chatRecord.receiveKey,
			data.count
		);

		let decryptedData = prism.prismDecrypt_Layer1(
			data.nonce,
			data.cypherText,
			derivedReceiveKey
		);

		await db.message.add({
			pubkey: chatRecord.pubkey,
			date: data.date,
			type: 'M',
			data: decryptedData.message,
			sent: false,
		});

		console.log('New Message Received: ', {
			from: from,
			message: decryptedData.message,
		});
	}
};

const processMessage_UNKNOWN = async (from: string) => {
	console.log(`Unknown message type from: ${from}`);
};

export const messageUtils = {
	pull: pull,
};
