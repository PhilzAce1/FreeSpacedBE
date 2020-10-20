/* -------------------------- External Dependencies ------------------------- */
import { NextFunction, Request, Response } from 'express';

/* -------------------------- Validators and Interfaces  ------------------------- */
import { CreateStoryDto } from '../dtos/story.dto';

/* -------------------------- Internal Dependencies ------------------------- */
import AuthService from '../services/auth.service';
import StoryService from '../services/story.service';

class StoryController {
	public storyService = new StoryService();
	public authService = new AuthService();
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
			storyData.creatorId = await this.authService.createAnonUser();
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
