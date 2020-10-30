/* -------------------------- External Dependencies ------------------------- */
import { NextFunction, Response } from 'express';
import { RequestWithUser } from '../interfaces/auth.interface';

/* -------------------------- Validators and Interfaces  ------------------------- */
import { CreateCommentDto } from '../dtos/comment.dto';
import { Comment } from '../interfaces/comment.interface';
import { CreateCommentReplyDto } from '../dtos/reply.dto';
/* -------------------------- Internal Dependencies ------------------------- */
import CommentService from '../services/comment.service';
import { Reply } from '../models/reply.model';

class CommentController {
	private commentService = new CommentService();

	public createComment = async (
		req: RequestWithUser,
		res: Response,
		next: NextFunction
	) => {
		try {
			const creatorId: string | undefined = req.user?.id;
			const commentData: CreateCommentDto = { ...req.body, creatorId };
			const createdComment: Comment = await this.commentService.createComment(
				commentData
			);
			res.status(200).json({
				success: true,
				payload: createdComment,
			});
		} catch (error) {
			next(error);
		}
	};
	public replyComment = async (
		req: RequestWithUser,
		res: Response,
		next: NextFunction
	) => {
		try {
			const creatorId: string | undefined = req.user?.id;
			const replyData: CreateCommentReplyDto = { ...req.body, creatorId };
			const replyComment: Reply = await this.commentService.replyComment(
				replyData
			);
			res.status(200).json({
				success: true,
				payload: replyComment,
			});
		} catch (error) {
			next(error);
		}
	};
}

export default CommentController;
