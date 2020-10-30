import { Router } from 'express';
import Route from '../interfaces/routes.interface';
import validationMiddleWare from '../middlewares/validation.middleware';
import { CreateCommentDto } from '../dtos/comment.dto';
import CommentController from '../controllers/comment.controller';
import authMiddleware from '../middlewares/auth.middleware';
import { CreateCommentReplyDto } from '../dtos/reply.dto';
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
