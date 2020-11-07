import { Tag } from '../models/tag.model';
// import { UserModel as User } from '../models/users.model';
import { Story } from '../models/story.model';
import HttpException from '../exceptions/HttpException';
import { In } from 'typeorm';
import StoryService from './story.service';
class TagService {
	private tag = Tag;
	// private user = User;
	private story = Story;
	private storyService = new StoryService();
	public async getAllTags() {
		const tags = await this.tag.find();
		return tags;
	}
	public async getRelatedStories(id) {
		const story = await this.story.findOne({
			where: { id: id },
			relations: ['tags'],
		});

		if (!story) throw new HttpException(404, 'story does not exist');
		const tagName = story.tags.map((tag) => tag.name);
		const relatedStories = await this.story.find({
			join: { alias: 'story', innerJoin: { tags: 'story.tags' } },
			where: (qb) => {
				qb.andWhere('tags.name IN (:...tagname)', { tagname: tagName });
			},
			relations: ['creator', 'tags'],
			take: 5,
		});
		const moreFromUser = await this.story.find({
			where: {
				creatorId: story.creatorId,
			},
			relations: ['creator', 'tags'],
			take: 5,
		});

		return {
			relatedStories: this.storyService.pruneStory(relatedStories),
			moreFromuser: this.storyService.pruneStory(moreFromUser),
		};
	}
	public async getStoriesByTagName(name) {
		const storiesByTag = await this.tag.findOne({
			where: { name },
			relations: ['stories', 'stories.creator'],
		});
		if (!storiesByTag)
			throw new HttpException(404, 'No Story was created with this Tag');
		return {
			...storiesByTag,
			stories: this.storyService.pruneStory(storiesByTag.stories),
		};
	}
	public async getStoriesByTag(tags) {
		let stories: any[] = [];
		const tagName = tags.map((tag) => tag.name);
		if (tags.length > 0) {
			stories = await this.tag.find({
				where: { name: In(tagName) },
			});
		}
		return stories;
	}
}
export default TagService;
