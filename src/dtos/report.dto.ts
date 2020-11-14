import { IsUUID } from 'class-validator';

export class ReportStoryDto {
	@IsUUID('4')
	storyId: string;

	complain: string;
}
export class ReportCommentDto {
	@IsUUID('4')
	commentId: string;
	complain: string;
}
export class ReportReplyDto {
	@IsUUID('4')
	replyId: string;
	complain: string;
}
