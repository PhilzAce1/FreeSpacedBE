import { IsString, IsUUID } from 'class-validator';
export class CreateCommentDto {
	@IsString()
	content: string;

	creatorId: string;

	@IsString()
	@IsUUID('4')
	storyId: string;
}
