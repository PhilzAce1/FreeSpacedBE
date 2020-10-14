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

  @MinLength(6)
  @MaxLength(20)
  @IsString()
  public username: string;

  public userId: number
}
