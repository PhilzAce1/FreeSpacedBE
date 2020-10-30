import { Router } from 'express';
import Route from '../interfaces/routes.interface';
import validationMiddleWare from '../middlewares/validation.middleware';
import authMiddleware from '../middlewares/auth.middleware';
import BookmarkController from '../controllers/bookmark.controller';
import { CreateBookmarkDto } from '../dtos/bookmark.dto';
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
	}
}

export default BookmarkRoute;
