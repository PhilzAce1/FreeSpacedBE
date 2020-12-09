import { redisDb } from '../utils/connectDB';
import { v4 } from 'uuid';
/** Functions
 * user = [id, id, id]
 * -> Check if special key exist
 * -> Gen cookie or special key
 * -> return story viewed arr
 * -> check if story exist
 * -> add story to the story array if story does not exist
 * -> if story exist => true | false
  
 */
export default class ViewService {
	private store = redisDb;

	/** Craete a Custom Cookie, set date and time
	 *
	 * @param cname -> Cookie name
	 * @param cvalue -> Cookie value
	 * @param exdays  -> Cookie Expiry date
	 */
	public async createCookie(cname: string, cvalue: string, exdays: number = 2) {
		const date = new Date();
		date.setTime(date.getTime() + exdays * 24 * 60 * 60 * 1000);
		const expires = 'expires=' + date.toUTCString();
		return `${cname}=${cvalue};expires=${expires};path=/`;
	}

	/**Check if User already exist and create a new UserId
	 *
	 * @param id -> userId
	 */
	public async userExistInStore(id: string | undefined) {
		const newuser = `${v4()}`;
		if (id === undefined) {
			return newuser;
		}
		const user = await this.store.get(id);

		if (typeof user === 'string') {
			return id;
		}
		this.store.set(id, JSON.stringify([]));
		return id;
	}

	/**
	 *
	 * @param id -> userId
	 * @param storyId  -> storyId
	 */
	public async storyHasBeenReadByUser(id: string, storyId) {
		const userStoryIdString = await this.userExists(id);
		const userStoryIdArray: string[] = JSON.parse(userStoryIdString);

		const storyViewed = this.userHasViewedStory(userStoryIdArray, storyId);
		if (!storyViewed) {
			this.addStoriesToUserViewedStories(id, userStoryIdArray, storyId);
		}
		return storyViewed;
	}
	/**
	 *
	 * @param storyArray -> Array of story ids of stories that has been viewd by user
	 * @param storyId -> story id
	 */
	private userHasViewedStory(storyArray: string[], storyId: string): boolean {
		return storyArray.some((id: string) => storyId === id);
	}
	/**
	 *
	 * @param userId -> UserID
	 * @param storyArr -> StoryArray
	 * @param storyId -> newStoryId
	 */
	private addStoriesToUserViewedStories(
		userId: string,
		storyArr: string[],
		storyId: string
	) {
		const addedStoryId = [...storyArr, storyId];
		this.store.set(userId, JSON.stringify(addedStoryId));
	}

	/**
	 * Check if a User exist in the Redis Store, return the User array
	 *
	 * @param id -> UserView Id : The user Id we use to track stories used by a user
	 */
	private async userExists(id: string): Promise<string> {
		const user = await this.store.get(id);

		if (typeof user === 'string') {
			return user;
		}

		const stringifyArr = JSON.stringify([]);
		this.store.set(id, stringifyArr);
		return stringifyArr;
	}
}
