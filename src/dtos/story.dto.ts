import { MinLength, IsString, IsBoolean } from 'class-validator';

export class CreateStoryDto {
	@MinLength(2)
	@IsString()
	public title: string;

	@IsString()
	public text: string;

	@IsBoolean()
	public is_spacecare: boolean;

	@IsBoolean()
	public allow_therapist: boolean;

	public creatorId: number;
}
