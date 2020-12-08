/**============External Dependecies============================ */
import { Router } from 'express';

/**--------------Interface, dtos and validation------------------ */
import { CreateBookmarkDto } from '../dtos/bookmark.dto';
import Route from '../interfaces/routes.interface';

/**-------------Internal dependencies --------------------------- */
import validationMiddleWare from '../middlewares/validation.middleware';
import authMiddleware from '../middlewares/auth.middleware';
import BookmarkController from '../controllers/bookmark.controller';
class BookmarkRoute implements Route {
	public path = '/bookmark';
	public router = Router();
	public bookmarkController = new BookmarkController();

	constructor() {
		this.initializeRoute();
	}

	private initializeRoute() {
		this.router.post(
			`${this.path}/create`,
			validationMiddleWare(CreateBookmarkDto),
			authMiddleware,
			this.bookmarkController.createBookmark
		);
		this.router.get(
			`${this.path}/`,
			authMiddleware,
			this.bookmarkController.getUserBookmarks
		);
		this.router.delete(
			`${this.path}/:bookmarkId`,
			authMiddleware,
			this.bookmarkController.deleteBookmark
		);
	}
}

export default BookmarkRoute;
