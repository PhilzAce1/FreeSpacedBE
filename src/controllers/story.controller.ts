/* -------------------------- External Dependencies ------------------------- */
import { NextFunction, Request, Response } from 'express';

/* -------------------------- Validators and Interfaces  ------------------------- */
import { CreateStoryDto } from '../dtos/story.dto';

/* -------------------------- Internal Dependencies ------------------------- */
import UserService from '../services/users.service';
import StoryService from '../services/story.service';

class StoryController {
	public storyService = new StoryService();
	public userService = new UserService();
	public getAllStories = async (
		_: Request,
		res: Response,
		next: NextFunction
	) => {
		try {
			const data = await this.storyService.getAllStories();
			res.status(200).json({
				success: true,
				data,
			});
		} catch (error) {
			next(error);
		}
	};
	public createPost = async (
		req: Request,
		res: Response,
		next: NextFunction
	) => {
		const storyData: CreateStoryDto = req.body;

		if (!storyData.creatorId) {
			storyData.creatorId = await this.userService.createAnonUser();
		}
		try {
			const createdStory = await this.storyService.createStory(storyData);
			res.status(200).json({
				data: createdStory,
				message: 'storyCreated',
			});
		} catch (error) {
			next(error);
		}
	};
}
export default StoryController;
