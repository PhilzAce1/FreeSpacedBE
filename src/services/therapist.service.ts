import { CreateUserDto, UpdateUserEmailDto } from '../dtos/users.dto';
import { User } from '../interfaces/users.interface';
import { isEmptyObject } from '../utils/util';
import { UserModel } from '../models/users.model';
import AuthService from './auth.service';
import HttpException from '../exceptions/HttpException';
import bcrypt from 'bcrypt';
import { createIdenticon } from '../utils/genImage';
import { ImageUrl } from '../config';
import UserService from './users.service';
import { Story } from '../models/story.model';
import { Waitlist } from '../models/waitlist.model';

class TherapistService {
	private users = UserModel;
	private story = Story;
	private authService = new AuthService();
	private userService = new UserService();
	private waitlist = Waitlist;
	public async dashboard() {
		const allStories = await this.story.find({});
		const allPostRepliedByTherapist = await this.story.find({
			where: { is_spacecare: true },
		});
		const allUser = await this.users.find({});
		return {
			allStoriesLength: allStories.length,
			allUserLength: allUser.length,
			allPostRepliedByTherapistLength: allPostRepliedByTherapist.length,
		};

		return 'hello';
	}
	public async addWaitlist(updateData: UpdateUserEmailDto) {
		const exist = await this.waitlist.findOne({
			email: updateData.email,
		});
		if (exist) {
			throw new HttpException(409, 'You are already on the waitlist');
		}
		const userExist = await this.users.findOne({
			email: updateData.email,
		});
		if (userExist) throw new HttpException(409, 'Email taken');

		await this.waitlist
			.create({
				email: updateData.email,
			})
			.save();
		return { message: "You've been added to our waitlist" };
	}
	public async signup(
		userData: CreateUserDto
	): Promise<{ cookie: string; findUser: User; token: string }> {
		if (isEmptyObject(userData))
			throw new HttpException(400, "You're not userData");

		const findUser = await this.users.findOne({
			where: { email: userData.email },
		});
		if (findUser)
			throw new HttpException(
				400,
				`You're email ${userData.email} already exists`
			);

		const hashedPassword = await bcrypt.hash(userData.password, 10);
		const generatedUsername = await this.authService.genUsername();
		const generatedImage = createIdenticon();
		const createUserData: User = {
			email: userData.email,
			username: generatedUsername,
			password: hashedPassword,
			profileimage: ImageUrl + generatedImage,
			role: 1,
		};
		const res = await this.users.create(createUserData).save();
		const tokenData = this.authService.createToken(res);
		const cookie = this.authService.createCookie(tokenData);

		await this.userService.sendVerifyUserEmail(userData.email);

		return { cookie, findUser: res, token: tokenData.token };
	}
}
export default TherapistService;
