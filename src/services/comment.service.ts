// import { UserModel } from '../models/users.model';
import { Comment } from '../models/comment.model';
import { CreateCommentDto } from '../dtos/comment.dto';
import { CreateCommentReplyDto } from '../dtos/reply.dto';
import { Reply } from '../models/reply.model';
import { Story } from '../models/story.model';
import HttpException from '../exceptions/HttpException';
import NotificationService from './notification.service';
class CommentService {
	private comment = Comment;
	private reply = Reply;
	private story = Story;
	private notification = new NotificationService();

	public async createComment(commentData: CreateCommentDto): Promise<Comment> {
		const { content, creatorId, storyId } = commentData;
		const storyExist = await this.story.findOne({ where: { id: storyId } });
		if (!storyExist) {
			throw new HttpException(404, 'Story does not exist, check story Id');
		}
		const createdComment = await this.comment
			.create({ content, creatorId, storyId })
			.save();
		await this.notification.newComment(creatorId, storyId);
		return createdComment;
	}
	public async replyComment(
		replyCommentData: CreateCommentReplyDto
	): Promise<Reply> {
		const { creatorId, content, commentId } = replyCommentData;
		const commentExist = await this.comment.findOne({
			where: { id: commentId },
		});
		if (!commentExist) {
			throw new HttpException(
				404,
				'comment you are trying to reply to to does not exist '
			);
		}
		const repliedComment = await this.reply
			.create({ creatorId, content, commentId })
			.save();
		this.notification.newReply(creatorId, commentId);
		return repliedComment;
	}
}
export default CommentService;
