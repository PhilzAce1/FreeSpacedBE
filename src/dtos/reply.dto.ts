import { IsString, IsUUID } from 'class-validator';
export class CreateCommentReplyDto {
	@IsString()
	content: string;

	creatorId: string;

	@IsString()
	@IsUUID()
	commentId: string;
}
