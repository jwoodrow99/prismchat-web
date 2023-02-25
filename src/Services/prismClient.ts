import { db } from '../Services/db';
import { Prism } from 'prismchat-lib';

const init: any = async (pubKey?: any, prvKey?: any) => {
	const identityKeys = await db.general
		.where('name')
		.equals('IdentityKeys')
		.first();

	if (pubKey && prvKey) {
		const prism: Prism = new Prism(pubKey, prvKey);
		await prism.init();
		return prism;
	} else if (identityKeys) {
		const prism: Prism = new Prism(
			identityKeys.value.public,
			identityKeys.value.private
		);
		await prism.init();
		return prism;
	} else {
		const prism: Prism = new Prism();
		await prism.init();
		prism.generateIdentityKeys();
		return prism;
	}
};

const exportObj = {
	init: init,
};

export default exportObj;
