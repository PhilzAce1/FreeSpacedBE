// import { UserModel } from '../models/users.model';
import { Comment } from '../models/comment.model';
import { CreateCommentDto } from '../dtos/comment.dto';
import { CreateCommentReplyDto } from '../dtos/reply.dto';
import { Reply } from '../models/reply.model';
import { Story } from '../models/story.model';
import { UserModel } from '../models/users.model';
import HttpException from '../exceptions/HttpException';
import NotificationService from './notification.service';
class CommentService {
	private comment = Comment;
	private reply = Reply;
	private users = UserModel;
	private story = Story;
	private notification = new NotificationService();

	public async createComment(commentData: CreateCommentDto): Promise<Comment> {
		const { content, creatorId, storyId } = commentData;
		const storyExist = await this.story.findOne({ where: { id: storyId } });
		const ThisUser = await this.users.findOne({ where: { id: creatorId } });

		if (!storyExist) {
			throw new HttpException(404, 'Story does not exist, check story Id');
		}
		const createdComment = await this.comment
			.create({ content, creatorId, storyId })
			.save();
		console.log(ThisUser);
		console.log(typeof ThisUser?.role);
		if (ThisUser?.role === 1) {
			await this.therapistComment(
				storyExist.creatorId,
				storyId,
				ThisUser.numberOfTherapistComment,
				creatorId
			);
		} else {
			await this.notification.newComment(creatorId, storyId);
		}
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
		await this.notification.newReply(creatorId, commentId);
		return repliedComment;
	}
	public async therapistComment(
		ownderOfStoryId,
		storyId,
		numberOfTherapistComment,
		creatorId
	) {
		const NoTC = (numberOfTherapistComment || 0) + 1;
		await this.users.update(
			{ id: ownderOfStoryId },
			{ numberOfTherapistComment: NoTC }
		);
		await this.notification.therapistComment(creatorId, storyId);
	}
}
export default CommentService;
