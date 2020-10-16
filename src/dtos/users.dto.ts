import {
  IsEmail,
  IsString,
  IsInt,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  public email: string;

  @IsString()
  public password: string;

  public userId: number
}
