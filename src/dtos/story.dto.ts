import {
	MinLength,
	IsString,
	IsBoolean,
	IsArray,
	IsUUID,
} from 'class-validator';

export class CreateStoryDto {
	@IsString()
	public text: string;

	@IsBoolean()
	public allow_therapist: boolean;

	@IsArray()
	public tags;

	public creatorId: string;
}

export class PublishStoryDto {
	@IsUUID()
	storyId: string;

	@IsBoolean()
	publish: boolean;

	creatorId: string;
}
export class UpdateStoryDto {
	@MinLength(2)
	@IsString()
	public title: string;

	@IsString()
	public text: string;

	@IsBoolean()
	public allow_therapist: boolean;

	@IsArray()
	public tags;

	public creatorId: string;

	@IsString()
	@IsUUID()
	public id: string;
}
