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
		const { tag, ...mainStory } = story as any;
		const newTagList: string[] = [];
		for (const tagData of tag) {
			newTagList.push(tagData.name);
		}
		mainStory.tag = newTagList;
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
		const {
			title,
			text,
			creatorId,
			is_spacecare,
			allow_therapist,
			tags,
		} = storyData;
		const tagArr: Tag[] = [];
		for (const tagData of tags) {
			const newTag = await this.getStoryTag(tagData);
			if (tagData) {
				tagArr.push(newTag);
			}
		}
		const createdStory = await this.story
			.create({
				title,
				text,
				is_spacecare,
				tags: tagArr,
				allow_therapist,
				creatorId: creatorId,
			})
			.save();
		return createdStory;
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
