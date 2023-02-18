// db.ts
import Dexie, { Table } from 'dexie';

export interface General {
	name: string;
	value: any;
}

export class PrismChatWebClientStore extends Dexie {
	// 'friends' is added by dexie when declaring the stores()
	// We just tell the typing system this is the case
	general!: Table<General>;

	constructor() {
		super('PrismChatWebClientStore');
		this.version(1).stores({
			general: 'name', // Primary key and indexed props
		});
	}
}

export const db = new PrismChatWebClientStore();
