/* -------------------------- External Dependencies ------------------------- */
import { NextFunction, Request, Response } from 'express';
import { RequestWithUser } from '../interfaces/auth.interface';
/* -------------------------- Validators and Interfaces  ------------------------- */
import {
	CreateStoryDto,
	UpdateStoryDto,
	PublishStoryDto,
	QuoteStoryDto,
} from '../dtos/story.dto';

/* -------------------------- Internal Dependencies ------------------------- */
import AuthService from '../services/auth.service';
import StoryService from '../services/story.service';
import HttpException from '../exceptions/HttpException';
import { Story } from '../models/story.model';

class StoryController {
	public storyService = new StoryService();
	public authService = new AuthService();

	public getAllSpaceCare = async (
		req: Request,
		res: Response,
		next: NextFunction
	) => {
		try {
			const allSpaceCareStories = await this.storyService.getAllSpaceCare(
				req.query
			);
			res.status(200).json({
				status: true,
				payload: allSpaceCareStories,
				length: allSpaceCareStories.length,
			});
		} catch (error) {
			next(error);
		}
	};
	public quoteStory = async (
		req: RequestWithUser,
		res: Response,
		next: NextFunction
	) => {
		try {
			const quoteStoryData: QuoteStoryDto = req.body;
			if (!quoteStoryData.creatorId) {
				quoteStoryData.creatorId = await this.authService.createAnonUser();
			}
			const quotedStory = await this.storyService.quoteStory(quoteStoryData);

			res.status(200).json({
				success: true,
				payload: quotedStory,
			});
		} catch (error) {
			next(error);
		}
	};

	public searchByTnD = async (
		req: Request,
		res: Response,
		next: NextFunction
	) => {
		try {
			if (req.query.search === undefined)
				throw new HttpException(404, 'Invalid Search Parameters');
			let search: any = req.query.search;
			if (search.match(/[^a-zA-Z0-9]+/g)) {
				res.json({
					success: false,
					message: 'Please search valid alphanumeric characters',
				});
			} else {
				const searchResult = await this.storyService.searchByTnD(
					search,
					req.query
				);
				res.status(200).json({
					success: true,
					payload: searchResult,
				});
			}
		} catch (error) {
			next(error);
		}
	};
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
			const data = await this.storyService.getAllStories(
				req.query,
				req.body.creatorId
			);
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
			const data = await this.storyService.getPostById(id, req);
			 
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

			const stories = await this.storyService.getPopularStories(
				query,
				req.body.creatorId
			);
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
