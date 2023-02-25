import { db } from '../Services/db';
import api from '../Services/api';
import prismClient from './prismClient';

const get = async () => {
	const prism: any = await prismClient.init();
	const newChats = await api.get('/message');

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
};

const processMessage_IC = async (from: string, data: any) => {
	await db.request.add({
		pubkey: from,
		receivedPublic: data,
	});
};

const processMessage_RC = async (from: string, data: any) => {
	const prism: any = await prismClient.init();
	const chatRecord: any = await db.chat.where('pubkey').equals(from).first();
	const { sendKey, receiveKey } = prism.generateSharedSessionKeysResponse(
		chatRecord.masterPublic,
		chatRecord.masterPrivate,
		data
	);
	await db.chat.update(from, {
		receiveKey: receiveKey,
		sendKey: sendKey,
	});
};

const processMessage_M = async (from: string, data: any) => {
	const prism: any = await prismClient.init();
	const chatRecord: any = await db.chat.where('pubkey').equals(from).first();
	const derivedReceiveKey = prism.sessionKeyDerivation(
		chatRecord.receiveKey,
		data.count
	);
	const decryptedData = prism.prismDecrypt_Layer1(
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
};

const processMessage_UNKNOWN = async (from: string) => {
	console.log(`Unknown message type from: ${from}`);
};

export const messageUtils = {
	get: get,
};
