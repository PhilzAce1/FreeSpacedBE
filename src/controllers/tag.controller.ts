import { Request, Response, NextFunction } from 'express';
import HttpException from '../exceptions/HttpException';
import TagService from '../services/tags.service';
class TagController {
	tagService = new TagService();

	public getAllTags = async (_, res: Response, next: NextFunction) => {
		try {
			const data = await this.tagService.getAllTags();
			res.status(200).json({
				length: data.length,
				success: true,
				payload: data,
			});
		} catch (error) {
			next(error);
		}
	};
	public getRelatedStories = async (
		req: Request,
		res: Response,
		next: NextFunction
	) => {
		try {
			if (req.params.storyId === undefined) {
				throw new HttpException(400, 'Invalid Story id');
			}
			const storyId = req.params.storyId;
			const relatedStories = await this.tagService.getRelatedStories(storyId);
			res.status(200).json({
				success: true,
				payload: relatedStories,
			});
		} catch (error) {
			next(error);
		}
	};
	public getStoriesFromTagName = async (
		req: Request,
		res: Response,
		next: NextFunction
	) => {
		try {
			if (req.params.name === undefined)
				throw new HttpException(400, 'invalid tag name');
			const storiesFromTag = await this.tagService.getStoriesByTagName(
				req.params.name
			);
			res.status(200).json({
				success: true,
				payload: storiesFromTag,
			});
		} catch (error) {
			next(error);
		}
	};
}
export default TagController;
