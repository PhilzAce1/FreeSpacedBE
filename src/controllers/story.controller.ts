/* -------------------------- External Dependencies ------------------------- */
import { NextFunction, Request, Response } from 'express';
import { validate as uuidValidator } from 'uuid';

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
				payload: data,
			});
		} catch (error) {
			next(error);
		}
	};

	public getPostById = async (
		req: Request,
		res: Response,
		next: NextFunction
	) => {
		const { id } = req.params;
		try {
			if (!uuidValidator(id)) {
				res.status(404).json({
					success: false,
					message: 'invalid story Id',
				});
			} else {
				const data = await this.storyService.getPostById(id);
				if (typeof data !== 'undefined') {
					res.status(200).json({
						success: true,
						payload: data,
					});
				} else {
					res.status(404).json({
						success: true,
						message: 'Story not found',
					});
				}
			}
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
				payload: createdStory,
				success: true,
			});
		} catch (error) {
			next(error);
		}
	};
}
export default StoryController;
