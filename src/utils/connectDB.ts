/**-------------------Databases ------------------- */
import { createConnection, getConnectionOptions } from 'typeorm';
import Redis from 'ioredis';

/**-----------------------Models------------------------ */
import { Story } from '../models/story.model';
import { UserModel } from '../models/users.model';
import { Comment } from '../models/comment.model';
import { Tag } from '../models/tag.model';
import { Reply } from '../models/reply.model';
import { Bookmark } from '../models/bookmark.model';
import { Reports } from '../models/reports.model';
import { Notification } from '../models/notification.model';
import { QuoteStory } from '../models/quotestory.model';
import { Waitlist } from '../models/waitlist.model';
/**-----------Env variables -------------------- */
import { __prod__ } from '../config';
export const redisDb = __prod__
	? new Redis(process.env.REDIS_URL)
	: new Redis();
async function connect() {
	const connectionOptions = await getConnectionOptions(process.env.NODE_ENV);
	const entities = [
		UserModel,
		Story,
		Tag,
		Comment,
		Reply,
		Bookmark,
		Reports,
		QuoteStory,
		Notification,
		Waitlist,
	];
	return process.env.NODE_ENV === 'production'
		? createConnection({
				...connectionOptions,
				url: process.env.DATABASE_URL,
				entities,
				name: 'default',
		  } as any)
		: createConnection({
				...connectionOptions,
				name: 'default',
				entities,
		  });
}
export async function database() {
	let retries = 10;
	while (retries) {
		try {
			await connect();
			console.log('Database connected');
			break;
		} catch (err) {
			console.log(err);
			retries -= 1;
			console.log(`retries left: ${retries}`);
			// wait 5 seconds
			await new Promise((res) => setTimeout(res, 5000));
		}
	}
}
