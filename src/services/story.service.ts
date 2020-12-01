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
import { validate as uuidValidator } from 'uuid';
import { Bookmark } from '../models/bookmark.model';
import { QuoteStory } from '../models/quotestory.model';
import { Like } from 'typeorm';

class StoryService {
	private story = storyModel;
	private tags = Tag;
	public bookmark = Bookmark;
	private quote = QuoteStory;

	public async quoteStory(quoteStoryData: QuoteStoryDto) {
		const { storyId } = quoteStoryData;
		const storyExist = (await this.story.findOne({
			where: { id: storyId },
			relations: ['quote', 'quote.story'],
		})) as any;

		if (!storyExist) throw new HttpException(404, 'Story does not exist');
		const storyWIthQuote = await this.createStory(quoteStoryData);
		await this.quote
			.create({
				quoteId: storyId,
				storyId: storyWIthQuote.id,
			})
			.save();
		await this.story.update(storyWIthQuote.id, {
			published: true,
		});
		const finalStory = await this.story.findOne({
			where: { id: storyWIthQuote.id },
			relations: [
				'story',
				'story.quote',
				'story.quote.creator',
				'story.quote.tags',
				'story.quote.comments',
				'story.quote.comments.creator',
			],
		});
		return this.mapQuotedStory(finalStory);
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
			relations: [
				'tags',
				'creator',
				'comments',
				'comments.creator',
				'reports',
				'story',
				'quote',
				'story.quote',
				'story.quote.creator',
				'story.quote.tags',
			],
			order: { createdAt: 'DESC' },
			where: { published: true },
		} as any;

		if (sort) {
			if (sort === 'mostpopular') {
				findOptions.order = { views: 'DESC' };
			}
			if (sort === 'latest') {
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
		const mapedStory = mapContributors(this.pruneStory(stories));
		const mapBookmarkedStories = this.userBookmarkedStory(
			mapedStory,
			userBookmarks
		);

		const quotedStoryArr = this.mapQuotedStoryArr(mapBookmarkedStories);
		return this.mapNumberOfQuotedPostArr(quotedStoryArr);
	}
	public async searchByTnD(search, query) {
		const { sort, limit, skip } = query;

		// const regex = new RegExp(`^${search}`, 'gi');
		const findOptions = {
			where: [
				{
					title: Like(`%${search}%`),
					published: true,
				},
				{
					text: Like(`%${search}%`),
					published: true,
				},
			],
			relations: [
				'tags',
				'creator',
				'comments',
				'comments.creator',
				'reports',
				'story',
				'quote',
				'story.quote',
				'story.quote.creator',
				'story.quote.tags',
			],
		} as any;
		if (sort) {
			if (sort === 'mostpopular') {
				findOptions.order = { views: 'DESC' };
			}
			if (sort === 'latest') {
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
		const prunedStory = this.pruneStory(stories);
		const mapedStory = mapContributors(prunedStory);
		const quotedStoryArr = this.mapReports(this.mapQuotedStoryArr(mapedStory));
		const mapedNumberOfQuotes = this.mapNumberOfQuotedPostArr(quotedStoryArr);
		return mapedNumberOfQuotes;
		// return findStory;
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
			if (sort === 'latest') {
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
		return this.mapNumberOfQuotedPostArr(
			mapContributors(this.pruneStory(stories))
		);
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
		if (uuidValidator(req.body.creatorId)) {
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
				relations: [
					'tags',
					'creator',
					'comments',
					'comments.creator',
					'story',
					'quote',
					'story.quote',
					'story.quote.creator',
					'story.quote.tags',
				],
				take: 1,
			});
		} else {
			story = await this.story.find({
				where: { slug: id },
				relations: [
					'tags',
					'creator',
					'comments',
					'comments.creator',
					'quote',
					'story',
					'story.quote',
					'story.quote.creator',
					'story.quote.tags',
				],
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
		mainStory.tags = newTagList;
		mainStory.creator = {
			profileimage: creator.profileimage,
			username: creator.username,
		};
		const postById = mapContributors([mainStory])[0];
		postById.bookMarked = userBookmarks.some((x) => postById.id === x);
		const mappedQuote = this.mapQuotedStory(postById);

		const mapNumberOfQuoted = this.mapNumberOfQuotedPost(mappedQuote);
		return mapNumberOfQuoted;
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
				published: true,
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
	private mapNumberOfQuotedPost(story) {
		const { quote, ...mainStory } = story;
		mainStory.quoted = quote.length;
		return mainStory;
	}
	private mapNumberOfQuotedPostArr(stories) {
		return stories.map((story) => this.mapNumberOfQuotedPost(story));
	}
	private async getStoryTag(name: string): Promise<Tag> {
		const storyTag = await this.tags.findOne({ where: { name } });
		if (storyTag) {
			return storyTag;
		}
		const newStoryTag = await this.tags.create({ name }).save();
		return newStoryTag;
	}
	public mapQuotedStoryArr(stories) {
		return stories.map((data) => {
			return this.mapQuotedStory(data);
		});
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
	public mapQuotedStory(story) {
		const { story: quote, comments, ...mainStory } = story;
		if (quote.length > 0) {
			const { creator, tags, ...quotedStory } = quote[0].quote;
			quotedStory.creator = {
				username: creator.username,
				profileimage: creator.profileimage,
			};
			quotedStory.tags = tags.map((x: any) => x.name);
			mainStory.hasQuotedStory = true;
			mainStory.quotedStory = quotedStory;
		} else {
			mainStory.hasQuotedStory = false;
			mainStory.quotedStory = {};
		}
		return mainStory;
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
	private mapReports(storyArr) {
		return storyArr.map((story) => {
			if (story.reports === undefined) {
				return {
					...story,
				};
			}
			return {
				...story,
				reports: story.reports.length,
			};
		});
	}
}
export default StoryService;
