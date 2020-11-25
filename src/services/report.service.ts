import { Reports } from '../models/reports.model';
import { Story } from '../models/story.model';
import { Comment } from '../models/comment.model';
import { Reply } from '../models/reply.model';
import {
	ReportCommentDto,
	ReportReplyDto,
	ReportStoryDto,
} from '../dtos/report.dto';
import HttpException from '../exceptions/HttpException';
import NotificationService from './notification.service';

class ReportService {
	public report = Reports;
	public story = Story;
	public comment = Comment;
	public reply = Reply;
	public notification = new NotificationService();
	public async init() {
		return 'Report Route Working';
	}
	public async reportStory(
		storyData: ReportStoryDto,
		userId: string
	): Promise<Reports> {
		const { storyId, complain } = storyData;
		const storyExist = await this.story.findOne({
			where: { id: storyId },
			relations: ['reports', 'creator'],
		});

		if (!storyExist) throw new HttpException(404, 'Story does not exist');

		const reportStory = this.report
			.create({
				storyId,
				creatorId: userId,
				complain,
			})
			.save();
		const storyCreatorEmail = storyExist.creator.email;
		await this.notification.bannedConetent(storyCreatorEmail, 'story_report');
		return reportStory;
	}

	public async reportComment(
		storyData: ReportCommentDto,
		userId: string
	): Promise<Reports> {
		const { commentId, complain } = storyData;
		const commentExist = await this.comment.findOne({
			where: { id: commentId },

			relations: ['reports', 'creator'],
		});

		if (!commentExist) throw new HttpException(404, 'Comment does not exist');

		const reportStory = this.report
			.create({
				commentId,
				creatorId: userId,
				complain,
			})
			.save();
		const commentCreatorEmail = commentExist.creator.email;
		await this.notification.bannedConetent(
			commentCreatorEmail,
			'comment_report'
		);
		return reportStory;
	}

	public async reportReply(
		storyData: ReportReplyDto,
		userId: string
	): Promise<Reports> {
		const { replyId, complain } = storyData;
		const replyExist = await this.reply.findOne({
			where: { id: replyId },
			relations: ['reports', 'creator'],
		});

		if (!replyExist) throw new HttpException(404, 'Comment does not exist');

		const reportStory = this.report
			.create({
				replyId,
				creatorId: userId,
				complain,
			})
			.save();
		const replyCreatorEmail = replyExist.creator.email;
		await this.notification.bannedConetent(replyCreatorEmail, 'reply_report');
		return reportStory;
	}
}
export default ReportService;
