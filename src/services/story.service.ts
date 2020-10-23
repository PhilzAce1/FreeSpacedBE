import { Story as storyModel } from '../models/story.model';
import { Tag } from '../models/tag.model';
import { Story } from '../interfaces/story.interface';
import { isEmptyObject } from '../utils/util';
import HttpException from '../exceptions/HttpException';
class StoryService {
	private story = storyModel;
	private tags = Tag;
	public async getAllStories(): Promise<Story[]> {
		const stories = await this.story.find();
		return stories;
	}
	public async getPostById(id: string): Promise<Story> {
		const story = await this.story.findOne({
			where: { id },
			relations: ['tags'],
		});

		const { tags, ...mainStory } = story as any;
		const newTagList: string[] = [];

		for (const tagData of tags) {
			newTagList.push(tagData.name);
		}
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

		const storyTitleExist = await this.story.findOne({
			where: { title: storyData.title },
		});
		if (storyTitleExist)
			throw new HttpException(400, 'This Title Already exist Please change it');
		const { title, text, creatorId, allow_therapist, tags } = storyData;
		const tagArr: Tag[] = [];
		if (tags) {
			for (const tagData of tags) {
				const newTag = await this.getStoryTag(tagData);
				if (tagData) {
					tagArr.push(newTag);
				}
			}
		}
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
	private async getStoryTag(name: string): Promise<Tag> {
		const storyTag = await this.tags.findOne({ where: { name } });
		if (storyTag) {
			return storyTag;
		}
		const newStoryTag = await this.tags.create({ name }).save();
		return newStoryTag;
	}
}

export default StoryService;
