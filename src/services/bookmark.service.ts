import { Bookmark } from '../models/bookmark.model';
import { Story } from '../models/story.model';
import { CreateBookmarkDto } from '../dtos/bookmark.dto';
import { mapContributorsForBookmarkRes } from '../utils/helpers';
import HttpException from '../exceptions/HttpException';
import UserService from '../services/users.service';
class BookmarkService {
	private bookmark = Bookmark;
	private story = Story;
	public async createBookmark(
		bookmarkData: CreateBookmarkDto
	): Promise<Bookmark> {
		const { creatorId, storyId } = bookmarkData;
		const story = await this.story.findOne({
			where: { id: storyId },
		});
		if (!story) {
			throw new HttpException(
				404,
				'The story you are bookmarked does not exist'
			);
		}
		const createdBookmark = await this.bookmark
			.create({
				creatorId,
				storyId,
			})
			.save();
		return createdBookmark;
	}
	public async getUserBookmarks(creatorId: string) {
		const userBookmarks = await this.bookmark.find({
			where: { creatorId: creatorId },
			relations: [
				'story',
				'creator',
				'story.creator',
				'story.comments',
				'story.comments.creator',
				'story.tags',
			],
		});
		return mapContributorsForBookmarkRes(
			UserService.removeUserData(userBookmarks)
		);
	}
}
export default BookmarkService;
