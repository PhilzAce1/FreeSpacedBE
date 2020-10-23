import { MinLength, IsString, IsBoolean, IsArray } from 'class-validator';

export class CreateStoryDto {
	@MinLength(2)
	@IsString()
	public title: string;

	@IsString()
	public text: string;

	@IsBoolean()
	public allow_therapist: boolean;

	@IsArray()
	public tags;

	public creatorId: number;
}
