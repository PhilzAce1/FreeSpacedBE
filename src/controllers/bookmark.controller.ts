/* -------------------------- External Dependencies ------------------------- */
import { NextFunction, Response } from 'express';
import HttpException from '../exceptions/HttpException';
import { RequestWithUser } from '../interfaces/auth.interface';

/* -------------------------- Validators and Interfaces  ------------------------- */
import { CreateBookmarkDto } from '../dtos/bookmark.dto';
import { Bookmark } from '../interfaces/bookmark.interface';
/* -------------------------- Internal Dependencies ------------------------- */
import BookmarkService from '../services/bookmark.service';

class BookmarkController {
	private bookmarkService = new BookmarkService();

	public createBookmark = async (
		req: RequestWithUser,
		res: Response,
		next: NextFunction
	) => {
		try {
			const creatorId: string | undefined = req.user?.id;
			const bookmarkData: CreateBookmarkDto = { ...req.body, creatorId };
			const createdBookmark: Bookmark = await this.bookmarkService.createBookmark(
				bookmarkData
			);
			res.status(200).json({
				success: true,
				payload: createdBookmark,
			});
		} catch (error) {
			next(error);
		}
	};
	public getUserBookmarks = async (
		req: RequestWithUser,
		res: Response,
		next: NextFunction
	) => {
		try {
			if (req.user?.id === undefined) {
				throw new HttpException(404, 'user does not exit');
			}
			const creatorId: string = req.user?.id;
			const userBookmarks: Bookmark[] = await this.bookmarkService.getUserBookmarks(
				creatorId
			);
			res.status(200).json({
				success: true,
				payload: userBookmarks,
			});
		} catch (error) {
			next(error);
		}
	};
}

export default BookmarkController;
