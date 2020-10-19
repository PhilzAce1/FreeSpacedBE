import { MinLength, IsString } from 'class-validator';

export class CreateStoryDto {
	@MinLength(2)
	@IsString()
	public title: string;

	@IsString()
	public text: string;

	// @IsInt()
	public creatorId: number;
}
