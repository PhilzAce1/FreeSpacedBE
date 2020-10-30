import { Story as storyModel } from '../models/story.model';
import { Tag } from '../models/tag.model';
import { Story } from '../interfaces/story.interface';
import { isEmptyObject } from '../utils/util';
import { UpdateStoryDto } from '../dtos/story.dto';
import HttpException from '../exceptions/HttpException';
class StoryService {
	private story = storyModel;
	private tags = Tag;
	public async getAllStories(): Promise<Story[]> {
		const stories = await this.story.find({
			relations: ['tags', 'creator'],
			order: { createdAt: 'DESC' },
		});
		return this.pruneStory(stories);
	}
	public async getPopularStories() {
		const stories = await this.story.find({
			order: { views: 'DESC' },
			take: 6,
		});
		// const stuff = await this.story.find({});
		// delelte this code
		// stuff.forEach(async (data) => {
		// 	if (data.views === null) {
		// 		await this.story.delete({ id: data.id });
		// 	}
		// });

		return stories;
	}
	public async getPostById(id: string): Promise<Story> {
		const story = await this.story.findOne({
			where: { id },
			relations: ['tags', 'creator', 'comments'],
		});

		if (!story) {
			throw new HttpException(404, 'story not found');
		}
		const { tags, ...mainStory } = story as any;
		const newTagList: string[] = this.getTagName(tags);
		mainStory.tags = newTagList;
		if (story?.views || story?.views === 0) {
			await this.story.update(id, { views: story?.views + 1 });
			mainStory.views = mainStory.views + 1;
		}

		return mainStory;
	}

	public async createStory(storyData): Promise<Story> {
		if (isEmptyObject(storyData))
			throw new HttpException(400, 'You have not inputed any Story Data');

		const { title, text, creatorId, allow_therapist, tags } = storyData;
		console.log(title);
		const tagArr: Tag[] = await this.pruneTag(tags);
		const createdStory = await this.story
			.create({
				title,
				text,
				tags: tagArr,
				allow_therapist,
				creatorId: creatorId,
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

	private pruneStory(arr): Story[] {
		const newArr: Story[] = [];
		arr.forEach((data) => {
			const creator = data;
			const { profileimage, username, firstname, lastname } = data.creator;
			creator.creator = {
				profileimage,
				username,
				firstname,
				lastname,
			};
			newArr.push(creator);
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
		if (tags) {
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

		for (const tagData of tags) {
			newTagList.push(tagData.name);
		}
		return newTagList;
	}
}

export default StoryService;
