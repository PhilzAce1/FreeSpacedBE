import { IsString, IsUUID } from 'class-validator';
export class CreateBookmarkDto {
	creatorId: string;

	@IsString()
	@IsUUID()
	storyId: string;
}
