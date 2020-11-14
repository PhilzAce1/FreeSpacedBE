import { Story as storyModel } from '../models/story.model';
import { Tag } from '../models/tag.model';
import { Story } from '../interfaces/story.interface';
import { isEmptyObject } from '../utils/util';
import {
	PublishStoryDto,
	QuoteStoryDto,
	UpdateStoryDto,
} from '../dtos/story.dto';
import HttpException from '../exceptions/HttpException';
import { genSlug, mapContributors } from '../utils/helpers';
import { validate as uuidValidator, v4 } from 'uuid';
import { Bookmark } from '../models/bookmark.model';
import { QuoteStory } from '../models/quotestory.model';
// import { getRepository } from 'typeorm';

class StoryService {
	private story = storyModel;
	private tags = Tag;
	public bookmark = Bookmark;
	private quote = QuoteStory;

	public async quoteStory(quoteStoryData: QuoteStoryDto) {
		const { storyId } = quoteStoryData;
		const quotedStory = await this.createStory(quoteStoryData);
		await this.quote
			.create({
				quoteId: storyId,
				storyId: quotedStory.id,
			})
			.save();
		const finalStory = await this.story.findOne({
			where: { id: quotedStory.id },
		});
		return finalStory;
	}

	public async publishAllStory() {
		const storiesInDb = await this.story.find();

		storiesInDb.forEach(
			async (story) => await this.story.update(story.id, { published: true })
		);
		return true;
	}

	public async publishStory(publishStoryData: PublishStoryDto) {
		const { publish, storyId, creatorId } = publishStoryData;
		const storyExist = await this.story.findOne({ where: { id: storyId } });
		if (!creatorId || creatorId !== storyExist?.creatorId)
			throw new HttpException(403, 'you are not the owner of this story');

		if (!storyExist) throw new HttpException(404, 'story has not been created');
		await this.story.update(storyId, { published: publish });
		return storyExist;
	}
	public async getAllStories(query, userId?) {
		let userBookmarks: string[] = [];
		if (userId) {
			let bookmarks = await this.bookmark.find({
				where: { creatorId: userId },
			});
			userBookmarks = bookmarks.map((x) => {
				return x.storyId;
			});
		}
		const { sort, limit, skip } = query;
		const findOptions = {
			relations: ['tags', 'creator', 'comments', 'comments.creator', 'reports'],
			order: { createdAt: 'DESC' },
			where: { published: true },
		} as any;

		if (sort) {
			if (sort === 'mostpopular') {
				findOptions.order = { views: 'DESC' };
			}
			if (sort === 'lastest') {
				findOptions.order = { createdAt: 'DESC' };
			}
			if (sort === 'freespacecertified') {
				findOptions.where = { is_spacecare: true };
			}
		}

		if (limit >= 1) {
			findOptions.take = limit;
		}
		if (skip >= 0) {
			findOptions.skip = skip;
		}
		const stories = await this.story.find(findOptions);
		console.log(stories.length);
		const mapedStory = mapContributors(this.pruneStory(stories));
		const mapBookmarkedStories = this.userBookmarkedStory(
			mapedStory,
			userBookmarks
		);
		return mapBookmarkedStories;
	}
	public async getPopularStories(query, userId?) {
		let userBookmarks: string[] = [];
		if (userId) {
			let bookmarks = await this.bookmark.find({
				where: { creatorId: userId },
			});
			userBookmarks = bookmarks.map((x) => {
				return x.storyId;
			});
		}
		const { tag, limit } = query;
		if (tag) {
			const popularStories = (await this.tags.findOne({
				where: { name: tag },
				relations: ['stories', 'stories.tags', 'stories.creator'],
			})) as any;
			if (!popularStories) {
				return [];
			}
			const { stories } = popularStories;
			const lim = Number(limit) || 6;
			const sortedStories = stories
				.sort((a, b) => b.views - a.views)
				.slice(0, lim);
			const prunedStory = this.pruneStory(sortedStories);

			return this.userBookmarkedStory(prunedStory, userBookmarks);
		}
		const findOptions = {
			order: { views: 'DESC' },
			where: { published: true },
			relations: ['creator', 'tags'],
		} as any;
		if (limit) {
			findOptions.take = Number(limit);
		}
		const stories = await this.story.find(findOptions);
		const prunedStory = this.pruneStory(stories);
		return this.userBookmarkedStory(prunedStory, userBookmarks);
	}
	public async filterStories(query) {
		const findOptions = {
			relations: ['tags', 'creator', 'comments', 'comments.creator'],
			where: { published: true },
		} as any;
		const { sort, limit, skip } = query;
		if (sort) {
			if (sort === 'mostpopular') {
				findOptions.order = { views: 'DESC' };
			}
			if (sort === 'lastest') {
				findOptions.order = { createdAt: 'DESC' };
			}
			if (sort === 'freespacecertified') {
				findOptions.where = { is_spacecare: true };
			}
		}

		if (limit) {
			findOptions.take = limit;
		}
		if (skip) {
			findOptions.skip = skip;
		}
		const stories = await this.story.find(findOptions);
		return mapContributors(this.pruneStory(stories));
	}
	public async getCommentsByStoryId(storyId) {
		let storyComment = await this.story.findOne({
			where: { id: storyId },
			select: ['id'],
			relations: [
				'comments',
				'comments.replies',
				'comments.creator',
				'comments.replies.creator',
				'comments.reports',
				'comments.replies.reports',
			],
		});

		return this.pruneComments(storyComment);
	}
	public async getPostById(id: string, req): Promise<Story> {
		let story;
		let userBookmarks: string[] = [];
		if (req.body.creatorId) {
			let bookmarks = await this.bookmark.find({
				where: { creatorId: req.body.creatorId },
			});
			userBookmarks = bookmarks.map((x) => {
				return x.storyId;
			});
		}
		// check if req param is by storyID or Slug
		if (uuidValidator(id)) {
			story = await this.story.find({
				where: { id },
				relations: ['tags', 'creator', 'comments', 'comments.creator'],
				take: 1,
			});
		} else {
			story = await this.story.find({
				where: { slug: id },
				relations: ['tags', 'creator', 'comments', 'comments.creator'],
				take: 1,
			});
		}

		// If no story was found return 404 error
		if (story.length < 1) {
			throw new HttpException(404, 'story not found');
		}

		// destructure tags and creator from storyData
		const { tags, creator, ...mainStory } = story[0] as any;
		let newTagList: string[] = [];

		// if tags are present, flatten to get only name
		if (tags) {
			newTagList = await this.getTagName(tags);
		}
		const userViews = req.session.userViews;
		const userViewsId = v4();
		// replace the orignal tag object to only tag name
		mainStory.tags = newTagList;
		if (mainStory.views || mainStory.views === 0) {
			if (!userViews) {
				await this.story.update(id, { views: mainStory.views + 1 });
				mainStory.views = mainStory.views + 1;
				req.session.userViews = {
					id: userViewsId,
					views: [{ id: mainStory.id }],
				};
			} else {
				const userHasAlreadyViewedStory = userViews.views.some(
					(story) => story.id === mainStory.id
				);
				if (!userHasAlreadyViewedStory) {
					await this.story.update(id, { views: mainStory.views + 1 });
					mainStory.views = mainStory.views + 1;
					userViews.views.push({ id: mainStory.id });
					req.session.userViews = userViews;
				}
			}
		}
		mainStory.creator = {
			profileimage: creator.profileimage,
			username: creator.username,
		};
		const postById = mapContributors([mainStory])[0];
		postById.bookMarked = userBookmarks.some((x) => postById.id === x);
		return postById;
	}

	public async createStory(storyData): Promise<Story> {
		if (isEmptyObject(storyData))
			throw new HttpException(400, 'You have not inputed any Story Data');

		const { title, text, creatorId, allow_therapist, tags } = storyData;
		const tagArr: Tag[] = await this.pruneTag(tags);
		const textAsTitle = title === undefined ? text.slice(0, 35) : title;
		const storySlug: string = await this.createStorySlug(textAsTitle);
		const createdStory = await this.story
			.create({
				title,
				text,
				tags: tagArr,
				allow_therapist,
				creatorId: creatorId,
				slug: storySlug,
			})
			.save();
		const { tags: createdStoryTag, ...mainStory } = createdStory as any;
		const newTagList: string[] = [];
		for (const tagData of createdStoryTag) {
			newTagList.push(tagData.name);
		}
		mainStory.tags = newTagList;
		return mainStory;
	}
	public async updateStory(storyData: UpdateStoryDto): Promise<storyModel> {
		if (isEmptyObject(storyData))
			throw new HttpException(400, 'You have not inputed any Story Data');

		const { id, title, text, allow_therapist, creatorId } = storyData;
		const storyExist = await this.story.findOne({ where: { id } });
		if (!storyExist) {
			throw new HttpException(404, 'Story  not found');
		}
		if (storyExist.creatorId !== creatorId) {
			throw new HttpException(403, 'you are not the owner of this story');
		}

		await this.story.update({ id }, { title, text, allow_therapist });
		const story = await this.story.findOne({
			where: { id },
			relations: ['tags', 'creator', 'comments'],
		});
		if (!story) {
			throw new HttpException(404, 'Story does not `exist');
		}
		return story;
	}
	public async deleteStory(deleteStoryData: {
		userId: string;
		storyId: string;
	}) {
		const { userId, storyId } = deleteStoryData;
		const storyExist = await this.story.findOne({
			where: { id: storyId },
		});
		if (!storyExist) {
			throw new HttpException(404, 'Story not found');
		}
		if (userId !== storyExist.creatorId) {
			throw new HttpException(403, 'this story does not belong to you');
		}
		const deletedStory = await this.story.delete({ id: storyId });

		return deletedStory;
	}
	private async createStorySlug(title: string): Promise<string> {
		const createdSlug = genSlug(title);
		const slugExist = await this.story.findOne({
			where: { slug: createdSlug },
		});
		if (slugExist) {
			return await this.createStorySlug(title);
		}
		return createdSlug;
	}
	private pruneComments(data) {
		function sortComment(arr) {
			const newArr = arr.sort((a, b) => {
				const first = new Date(a.createdAt);
				const second = new Date(b.createdAt);
				const firstDate = first.getTime();
				const lastDate = second.getTime();
				return lastDate - firstDate;
			});
			return newArr;
		}

		const sortedComments = sortComment(data.comments);

		data.comments = sortedComments.map((comment) => {
			const { id, content, createdAt, creator } = comment;
			const sortedReplies = sortComment(comment.replies);
			const replies = sortedReplies.map((reply) => {
				const { id, content, creatorId, commentId, createdAt } = reply;
				return (reply = {
					id,
					content,
					creatorId,
					commentId,
					createdAt,
					creator: {
						username: reply.creator.username,
						profileimage: reply.creator.profileimage,
					},
					reports: reply.reports.length,
				});
			});
			return (comment = {
				id,
				content,
				createdAt,
				replies,
				creator: {
					username: creator.username,
					profileimage: creator.profileimage,
				},
				reports: comment.reports.length,
			});
		});

		return data;
	}
	public pruneStory(arr): Story[] {
		const newArr: Story[] = [];
		arr.forEach((data) => {
			const story = data;
			const storyTagName = this.getTagName(data.tags);
			const { profileimage, username } = data.creator;
			story.creator = {
				profileimage,
				username,
			};
			story.tags = storyTagName;
			newArr.push(story);
		});
		return newArr;
	}
	private async getStoryTag(name: string): Promise<Tag> {
		const storyTag = await this.tags.findOne({ where: { name } });
		if (storyTag) {
			return storyTag;
		}
		const newStoryTag = await this.tags.create({ name }).save();
		return newStoryTag;
	}
	private async pruneTag(tags: string[]): Promise<Tag[] | []> {
		const tagArr: Tag[] = [];
		if (tags.length > 0) {
			for (const tagData of tags) {
				const newTag = await this.getStoryTag(tagData);
				if (tagData) {
					tagArr.push(newTag);
				}
			}
		}
		return tagArr;
	}
	private getTagName(tags: Tag[]): string[] {
		const newTagList: string[] = [];
		if (tags.length > 0) {
			for (const tagData of tags) {
				newTagList.push(tagData.name);
			}
		}
		return newTagList;
	}
	private userBookmarkedStory(storyArr: Story[], bookmarkArr: string[]) {
		return storyArr.map((story) => {
			const bookMarked = bookmarkArr.some((x) => x === story.id);
			if (story.reports === undefined) {
				return {
					...story,
					bookMarked,
				};
			}
			return {
				...story,
				bookMarked,
				reports: story.reports.length,
			};
		});
	}
}

export default StoryService;
