// db.ts
import Dexie, { Table } from 'dexie';

export interface General {
	name: string;
	value: any;
}

export interface Chat {
	name: string;
	pubkey: string;
	masterPublic: string;
	masterPrivate: string;
	sendCount: number;
	sendKey: string;
	receiveKey: string;
	newMessage: boolean;
}

export interface Request {
	pubkey: string;
	receivedPublic: string;
}

export interface Message {
	pubkey: string;
	date: number;
	type: string;
	data: string;
	sent: boolean; // boolean to identify weather sent or received
}

export class PrismChatWebClientStore extends Dexie {
	// 'friends' is added by dexie when declaring the stores()
	// We just tell the typing system this is the case
	general!: Table<General>;
	chat!: Table<Chat>;
	request!: Table<Request>;
	message!: Table<Message>;

	constructor() {
		super('PrismChatWebClientStore');
		this.version(1).stores({
			general: '&name', // Primary key and indexed props
			chat: '&pubkey',
			request: '&pubkey',
			message: '++id, pubkey, date',
		});
	}
}

export const db = new PrismChatWebClientStore();
