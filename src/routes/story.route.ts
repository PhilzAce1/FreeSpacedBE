import { Router } from 'express';
import Route from '../interfaces/routes.interface';
import StoryController from '../controllers/story.controller';
import validationMiddleware from '../middlewares/validation.middleware';
import { CreateStoryDto, UpdateStoryDto } from '../dtos/story.dto';
import authMiddleware from '../middlewares/auth.middleware';
class StoryRoute implements Route {
	public path = '/story';
	public router = Router();
	public storyController = new StoryController();
	constructor() {
		this.initializeRoutes();
	}
	private initializeRoutes() {
		this.router.get(`${this.path}`, this.storyController.getAllStories);
		this.router.get(`${this.path}/:id`, this.storyController.getPostById);
		this.router.get(
			`${this.path}/popular/getstories`,
			this.storyController.getPopularStories
		);
		this.router.post(
			`${this.path}/create`,
			validationMiddleware(CreateStoryDto),
			this.storyController.createPost
		);
		this.router.patch(
			`${this.path}/update`,
			validationMiddleware(UpdateStoryDto),
			authMiddleware,
			this.storyController.updateStory
		);
		this.router.delete(
			`${this.path}/delete/:id`,

			validationMiddleware(UpdateStoryDto),
			authMiddleware,
			this.storyController.deleteStory
		);
	}
}
export default StoryRoute;
