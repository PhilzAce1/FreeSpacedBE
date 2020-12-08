/**============External Dependecies============================ */
import { Router } from 'express';
import Route from '../interfaces/routes.interface';

/**--------------Interface, dtos and validation------------------ */
import { CreateCommentDto } from '../dtos/comment.dto';
import { CreateCommentReplyDto } from '../dtos/reply.dto';

/**-------------Internal dependencies --------------------------- */
import CommentController from '../controllers/comment.controller';
import validationMiddleWare from '../middlewares/validation.middleware';
import authMiddleware from '../middlewares/auth.middleware';
class CommentRoute implements Route {
	public path = '/comment';
	public router = Router();
	public commentController = new CommentController();

	constructor() {
		this.initializeRoute();
	}
	private initializeRoute() {
		this.router.post(
			`${this.path}/create`,
			validationMiddleWare(CreateCommentDto),
			authMiddleware,
			this.commentController.createComment
		);
		this.router.post(
			`${this.path}/reply`,
			validationMiddleWare(CreateCommentReplyDto),
			authMiddleware,
			this.commentController.replyComment
		);
	}
}

export default CommentRoute;
