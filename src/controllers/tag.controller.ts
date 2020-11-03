import { Response, NextFunction } from 'express';
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
}
export default TagController;
