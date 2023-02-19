// db.ts
import Dexie, { Table } from 'dexie';

export interface General {
	name: string;
	value: any;
}

export interface Chat {
	pubkey: string;
	masterPublic: string;
	masterPrivate: string;
	sendCount: number;
	sendKey: string;
	receiveKey: string;
}

export interface Message {
	pubkey: string;
	date: number;
	type: string;
	data: string;
	sent: boolean; // boolean to identify weather sent or received
}

// export interface Request {
// 	id: number;
// 	pubkey: string;
// 	date: string;
// 	type: string;
// 	data: string;
// }

export class PrismChatWebClientStore extends Dexie {
	// 'friends' is added by dexie when declaring the stores()
	// We just tell the typing system this is the case
	general!: Table<General>;
	chat!: Table<Chat>;
	message!: Table<Message>;

	constructor() {
		super('PrismChatWebClientStore');
		this.version(1).stores({
			general: '&name', // Primary key and indexed props
			chat: '&pubkey',
			message: '++id, pubkey, date',
		});
	}
}

export const db = new PrismChatWebClientStore();
