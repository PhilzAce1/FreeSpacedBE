import { Tag } from '../models/tag.model';
// import { UserModel as User } from '../models/users.model';
import { Story } from '../models/story.model';
import HttpException from '../exceptions/HttpException';
import { In } from 'typeorm';
import StoryService from './story.service';
import moment from 'moment';
class TagService {
	private tag = Tag;
	// private user = User;
	private story = Story;
	private storyService = new StoryService();
	public async getAllTags() {
		const tags = await this.tag.find({
			relations: ['stories'],
		});
		const tagsWithStoryCount = tags
			.map((tag) => {
				const { stories, ...tagData } = tag;

				return {
					...tagData,
					numberOfStories: stories.length,
				};
			})
			.sort((a, b) => b.numberOfStories - a.numberOfStories);
		return tagsWithStoryCount;
	}
	public async getTrendingTags() {
		const tags = await this.tag.find({
			relations: ['stories'],
		});

		const filStories = tags
			.map((tag) => {
				const { stories } = tag;
				const recentStories = stories.filter((story) => {
					const { createdAt } = story;
					const today = Date.now();

					const thisDay = new Date(today).getDate();
					const storyDay = new Date(createdAt).getDate();
					const thisMonth = new Date(today).getMonth();
					const storyMonth = new Date(createdAt).getMonth();

					const thisYear = new Date(today).getFullYear();
					const storyYear = new Date(createdAt).getFullYear();
					const valid =
						!moment(createdAt).isAfter(moment().subtract(2, 'hours')) &&
						thisYear <= storyYear &&
						thisMonth <= storyMonth &&
						thisDay <= storyDay;

					return valid;
				});
				return { ...tag, stories: recentStories.length };
			})
			.filter((story) => story.stories !== 0)
			.sort((a, b) => b.stories - a.stories)
			.slice(0, 6);

		return filStories;
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
			take: 4,
		});
		const moreFromUser = await this.story.find({
			where: {
				creatorId: story.creatorId,
			},
			relations: ['creator', 'tags'],
			take: 4,
		});
		const filteredRelatedStories = relatedStories
			.filter((relatedStory) => relatedStory.id !== story.id)
			.slice(0, 3);
		const filteredMoreFromUser = moreFromUser
			.filter((userStory) => userStory.id !== story.id)
			.slice(0, 3);
		console.log(moreFromUser);
		return {
			relatedStories: this.storyService.pruneStory(filteredRelatedStories),
			moreFromuser: this.storyService.pruneStory(filteredMoreFromUser),
		};
	}
	public async getStoriesByTagName(name) {
		const storiesByTag = await this.tag.findOne({
			where: { name },
			relations: ['stories', 'stories.creator', 'stories.tags'],
		});
		if (!storiesByTag) return [];
		const prunedStories = this.storyService.pruneStory(storiesByTag.stories);
		return {
			...storiesByTag,
			stories: prunedStories,
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
