import { Story as storyModel } from '../models/story.model';
import { Tag } from '../models/tag.model';
import { Story } from '../interfaces/story.interface';
import { isEmptyObject } from '../utils/util';
import { PublishStoryDto, UpdateStoryDto } from '../dtos/story.dto';
import HttpException from '../exceptions/HttpException';
import { genSlug, mapContributors } from '../utils/helpers';
import { validate as uuidValidator } from 'uuid';
// import { getRepository } from 'typeorm';

class StoryService {
	private story = storyModel;
	private tags = Tag;

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
	public async getAllStories(query): Promise<Story[]> {
		const { sort, limit, skip } = query;
		const findOptions = {
			relations: ['tags', 'creator', 'comments', 'comments.creator'],
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

		if (limit) {
			findOptions.take = limit;
		}
		if (skip) {
			findOptions.skip = skip;
		}
		const stories = await this.story.find(findOptions);
		return mapContributors(this.pruneStory(stories));
	}
	public async getPopularStories(query) {
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

			return this.pruneStory(sortedStories);
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

		return this.pruneStory(stories);
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
			],
		});

		return this.pruneComments(storyComment);
	}
	public async getPostById(id: string): Promise<Story> {
		let story;
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

		if (story.length < 1) {
			throw new HttpException(404, 'story not found');
		}

		const { tags, creator, ...mainStory } = story[0] as any;
		let newTagList: string[] = [];
		if (tags) {
			newTagList = await this.getTagName(tags);
		}
		mainStory.tags = newTagList;
		if (story?.views || story?.views === 0) {
			await this.story.update(id, { views: story?.views + 1 });
			mainStory.views = mainStory.views + 1;
		}
		mainStory.creator = {
			profileimage: creator.profileimage,
			username: creator.username,
		};
		return mapContributors([mainStory])[0];
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
}

export default StoryService;
