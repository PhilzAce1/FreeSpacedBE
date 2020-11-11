import { IsEmail, IsString } from 'class-validator';

export class CreateUserDto {
	@IsEmail()
	public email: string;

	@IsString()
	public password: string;

	public userId: string;
}

export class UpdateUserEmailDto {
	@IsEmail()
	public email: string;
}
export class ChangePasswordDto {
	@IsString()
	newPassword: string;
	@IsString()
	oldPassword: string;
}
export class UpdateProfileDto {
	@IsString()
	firstname: string;
	@IsString()
	lastname: string;
	@IsString()
	username: string;
	@IsString()
	profileimage: string;
	@IsString()
	coverimage: string;
}
