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

		if (ThisUser?.role === 1) {
			await this.therapistComment(
				storyExist.creatorId,
				storyId,
				ThisUser.numberOfTherapistComment,
				creatorId
			);
			let createdComment = await this.comment
				.create({ content, creatorId, storyId, is_freespaace_therapist: true })
				.save();

			return createdComment;
		} else {
			await this.notification.newComment(creatorId, storyId);

			let createdComment = await this.comment
				.create({ content, creatorId, storyId })
				.save();

			return createdComment;
		}
	}
	public async replyComment(
		replyCommentData: CreateCommentReplyDto
	): Promise<Reply> {
		const { creatorId, content, commentId } = replyCommentData;
		const ownerOfComment = await this.users.findOne({
			where: { id: creatorId },
		});
		const commentExist = await this.comment.findOne({
			where: { id: commentId },
		});
		if (!commentExist) {
			throw new HttpException(
				404,
				'comment you are trying to reply to to does not exist '
			);
		}
		if (ownerOfComment?.role === 1) {
			const repliedComment = await this.reply
				.create({
					creatorId,
					content,
					commentId,
					is_freespaace_therapist: true,
				})
				.save();
			await this.notification.newReply(creatorId, commentId);

			return repliedComment;
		} else {
			const repliedComment = await this.reply
				.create({ creatorId, content, commentId })
				.save();
			await this.notification.newReply(creatorId, commentId);
			return repliedComment;
		}
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
		await this.story.update(storyId, {
			is_spacecare: true,
		});
		console.log(storyId);
		await this.notification.therapistComment(creatorId, storyId);
	}
}
export default CommentService;
