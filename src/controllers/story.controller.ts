/* -------------------------- External Dependencies ------------------------- */
import { NextFunction, Request, Response } from 'express';
import { RequestWithUser } from '../interfaces/auth.interface';
/* -------------------------- Validators and Interfaces  ------------------------- */
import {
	CreateStoryDto,
	UpdateStoryDto,
	PublishStoryDto,
} from '../dtos/story.dto';

/* -------------------------- Internal Dependencies ------------------------- */
import AuthService from '../services/auth.service';
import StoryService from '../services/story.service';
import HttpException from '../exceptions/HttpException';
import { Story } from '../models/story.model';

class StoryController {
	public storyService = new StoryService();
	public authService = new AuthService();

	public publishStory = async (
		req: Request,
		res: Response,
		next: NextFunction
	) => {
		try {
			const publishStoryData: PublishStoryDto = req.body;
			const publishedStory = await this.storyService.publishStory(
				publishStoryData
			);

			res.status(200).json({
				success: true,
				payload: publishedStory,
			});
		} catch (error) {
			next(error);
		}
	};

	public getAllStories = async (
		req: Request,
		res: Response,
		next: NextFunction
	) => {
		try {
			const data = await this.storyService.getAllStories(req.query);
			res.status(200).json({
				success: true,
				payload: data,
			});
		} catch (error) {
			next(error);
		}
	};

	public publishAllStories = async (
		_: Request,
		res: Response,
		next: NextFunction
	) => {
		try {
			const data = await this.storyService.publishAllStory();
			res.status(200).json({
				success: true,
				payload: data,
			});
		} catch (error) {
			next(error);
		}
	};

	public filterStories = async (
		req: Request,
		res: Response,
		next: NextFunction
	) => {
		try {
			const filteredStories = await this.storyService.filterStories(req.query);
			res.status(200).json({
				success: true,
				payload: filteredStories,
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
		} catch (error) {
			next(error);
		}
	};
	public getPopularStories = async (
		req: Request,
		res: Response,
		next: NextFunction
	) => {
		try {
			const { query } = req;
			const stories = await this.storyService.getPopularStories(query);
			res.status(200).json({
				success: true,
				payload: stories,
			});
		} catch (error) {
			next(error);
		}
	};
	public getCommentsByStoryId = async (
		req: Request,
		res: Response,
		next: NextFunction
	) => {
		const storyId = req.params.id;
		if (storyId === undefined)
			throw new HttpException(400, 'Story id is required');
		try {
			const storyComment = await this.storyService.getCommentsByStoryId(
				storyId
			);
			res.status(200).json({
				success: true,
				payload: storyComment,
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
				payload: createdStory,
				success: true,
			});
		} catch (error) {
			next(error);
		}
	};
	public updateStory = async (
		req: RequestWithUser,
		res: Response,
		next: NextFunction
	) => {
		if (req.user?.id === undefined) {
			throw new HttpException(404, 'User auth token is invalid');
		}

		const userId = req.user?.id;
		const storyData: UpdateStoryDto = req.body;

		try {
			const updatedStory: Story = await this.storyService.updateStory({
				...storyData,
				creatorId: userId,
			});

			res.status(200).json({
				payload: updatedStory,
				success: true,
			});
		} catch (error) {
			next(error);
		}
	};
	public deleteStory = async (
		req: RequestWithUser,
		res: Response,
		next: NextFunction
	) => {
		if (req.user?.id === undefined) {
			throw new HttpException(404, 'User auth token is invalid');
		}
		if (req.params.id === undefined) {
			throw new HttpException(400, 'Story Id needs to be provided');
		}
		const userId = req.user.id;
		const storyId = req.params.id;

		try {
			await this.storyService.deleteStory({
				storyId,
				userId,
			});
			res.status(200).json({
				success: true,
				payload: {
					message: 'story deleted',
				},
			});
		} catch (error) {
			next(error);
		}
	};
}
export default StoryController;
