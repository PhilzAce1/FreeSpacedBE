import { IsInt, MinLength, IsString } from 'class-validator'

export class CreateStoryDto {
    @IsString()
    public title: string


    @IsString()
    public text: string

    // @IsInt()
    public creatorId: number
}