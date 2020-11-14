import { Router } from 'express';
import Route from '../interfaces/routes.interface';
import StoryController from '../controllers/story.controller';
import validationMiddleware from '../middlewares/validation.middleware';
import {
	CreateStoryDto,
	UpdateStoryDto,
	PublishStoryDto,
} from '../dtos/story.dto';
import authMiddleware from '../middlewares/auth.middleware';
import storyMiddelware from '../middlewares/story.middleware';
class StoryRoute implements Route {
	public path = '/story';
	public router = Router();
	public storyController = new StoryController();
	constructor() {
		this.initializeRoutes();
	}
	private initializeRoutes() {
		this.router.get(
			`${this.path}`,
			storyMiddelware,
			this.storyController.getAllStories
		);

		this.router.get(`${this.path}/:id`, this.storyController.getPostById);

		this.router.get(
			`${this.path}/popular/getstories`,
			storyMiddelware,

			this.storyController.getPopularStories
		);
		this.router.get(
			`${this.path}/filter/sortstories`,
			this.storyController.filterStories
		);
		this.router.get(
			`${this.path}/comments/:id`,
			this.storyController.getCommentsByStoryId
		);
		this.router.get(
			`${this.path}/updateproddb/publishall`,
			this.storyController.publishAllStories
		);
		this.router.post(
			`${this.path}/create`,
			validationMiddleware(CreateStoryDto),
			storyMiddelware,
			this.storyController.createPost
		);
		this.router.put(
			`${this.path}/publish`,

			validationMiddleware(PublishStoryDto),
			storyMiddelware,
			this.storyController.publishStory
		);
		this.router.patch(
			`${this.path}/update`,
			validationMiddleware(UpdateStoryDto),
			authMiddleware,
			this.storyController.updateStory
		);
		this.router.delete(
			`${this.path}/delete/:id`,
			authMiddleware,
			this.storyController.deleteStory
		);
	}
}
export default StoryRoute;
