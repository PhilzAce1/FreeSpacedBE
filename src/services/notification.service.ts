import { Notification, notificationType } from '../models/notification.model';
import { UserModel } from '../models/users.model';
import { Story } from '../models/story.model';
import { Comment } from '../models/comment.model';
import { sendMessage } from '../utils/sendMail';
import io from '../socket';
class NotificationService {
	public socket = io.sockets;
	public notification = Notification;
	public story = Story;
	public user = UserModel;
	public comment = Comment;

	/** The rapist comment */
	public async therapistComment(userId, storyId) {
		const {
			storyUserId,
			username,
			userEmail,
			storypref,
		} = await this.createNotification(userId, storyId);
		const notificationMessage = this.notifcationMessage(
			'therapist_reply',
			username,
			storypref
		);

		if (storyUserId !== userId) {
			// create notification
			const newNotification = await this.notification
				.create({
					content: notificationMessage,
					storyId: storyId,
					userId: storyUserId,
					actionuserId: userId,
					type: 'comment',
				})
				.save();
			// send email to creator of story
			if (userEmail) {
				await sendMessage(userEmail, 'therapist_reply', notificationMessage);
			}
			await this.socket.emit('NOTIFICATION', newNotification);
			/// send notification to creator of story
		}
	}
	/**Create a new comment notification */
	public async newComment(userId, storyId) {
		const {
			storyUserId,
			username,
			userEmail,
			storypref,
		} = await this.createNotification(userId, storyId);
		const notificationMessage = this.notifcationMessage(
			'comment',
			username,
			storypref
		);

		if (storyUserId !== userId) {
			// create notification
			const newNotification = await this.notification
				.create({
					content: notificationMessage,
					storyId: storyId,
					userId: storyUserId,
					actionuserId: userId,
					type: 'comment',
				})
				.save();
			// send email to creator of story
			if (userEmail) {
				await sendMessage(userEmail, 'comment', notificationMessage);
			}
			await this.socket.emit('NOTIFICATION', newNotification);
			/// send notification to creator of story
		}
	}

	/**===================Notify on new Reply=========================== */
	public async newReply(userId, commentId) {
		const {
			username,
			storyUserId,
			storyId,
			storypref,
			commentpref,
			commentUserId,
			commentUseremail,
			userEmail,
		} = await this.createNotificationForCommentReply(userId, commentId);
		const notifcationMessageForOwnerOfComment = this.notifcationMessage(
			'comment_reply',
			username,
			commentpref
		);
		const notificationMessageForOwnerOfStory = this.notifcationMessage(
			'story_comment_reply',
			username,
			storypref
		);

		// create notification for story owner
		const userNotification = await this.notification
			.create({
				content: notificationMessageForOwnerOfStory,
				storyId: storyId,
				userId: storyUserId,
				actionuserId: userId,
				type: 'story_comment_reply',
			})
			.save();
		await this.socket.emit('NOTIFICATION', userNotification);

		// create notification for comment owner
		const commentNotification = await this.notification
			.create({
				content: notifcationMessageForOwnerOfComment,
				storyId: storyId,
				userId: commentUserId,
				actionuserId: userId,
				type: 'comment_reply',
			})
			.save();
		await this.socket.emit('NOTIFICATION', commentNotification);

		// send mail to creator of story
		if (userEmail) {
			await sendMessage(
				userEmail,
				'comment',
				notificationMessageForOwnerOfStory
			);
		}
		// send mail to creator of comment
		if (commentUseremail) {
			await sendMessage(
				commentUseremail,
				'comment',
				notifcationMessageForOwnerOfComment
			);
		}
		// send notifcation to creator of story
		// send comment to creator of comment
	}

	/**===================Notify on  Banned Content =========================== */

	public async bannedConetent(userEmail, type: notificationType) {
		// check for type
		const notifcationMessage = this.notifcationMessage(type);
		// Get story

		// send report email
		if (userEmail) {
			await sendMessage(userEmail, 'notification', notifcationMessage);
		}
	}

	/**===================Create a Notification depency property =========================== */

	public async createNotification(userId, storyId) {
		const user = await this.user.findOne(userId);
		const story = await this.story.findOne({
			where: { id: storyId },
			relations: ['creator'],
		});

		const storypref = story?.title ? story.title : story?.text;

		return {
			storyUserId: story?.creatorId,
			username: user?.username,
			userEmail: story?.creator.email,
			storypref: storypref?.slice(0, 30),
		};
	}
	public async createNotificationForCommentReply(userId, commentId) {
		const comment = await this.comment.findOne({
			where: { id: commentId },
			relations: ['creator'],
		});
		const commentpref = comment?.content.slice(0, 30);
		const storyNofication = await this.createNotification(
			userId,
			comment?.storyId
		);

		return {
			...storyNofication,
			storyId: comment?.storyId,
			commentpref,
			commentUserId: comment?.creatorId,
			commentUseremail: comment?.creator.email,
		};
	}
	public async notifyEveryUserByTag() {}

	private notifcationMessage(
		notificationType: notificationType,
		username?: string,
		storypref?
	) {
		return notificationType === 'comment'
			? `${username} commented on your story (${storypref})`
			: notificationType === 'comment_reply'
			? `${username} Replied Your comment on a story (${storypref})`
			: notificationType === 'reply_report'
			? `Your reply to a comment has been banned`
			: notificationType === 'comment_report'
			? `Your comment on a story has  been banned`
			: notificationType === 'story_comment_reply'
			? `${username} replied a comment on your story (${storypref})`
			: 'Your story has been banned';
	}
}

export default NotificationService;
