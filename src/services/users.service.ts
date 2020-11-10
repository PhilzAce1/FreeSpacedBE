import * as bcrypt from 'bcrypt';
import { CreateUserDto, UpdateProfileDto } from '../dtos/users.dto';
import HttpException from '../exceptions/HttpException';
import { User } from '../interfaces/users.interface';
import { UserModel as userModel } from '../models/users.model';
import { isEmptyObject } from '../utils/util';
import { __prod__ } from '../config';
import { redisDb } from '../utils/connectDB';
import { v4 } from 'uuid';
import { sendMessage } from '../utils/sendMail';
import { Story } from '../models/story.model';
import { Story as StoryInterface } from '../interfaces/story.interface';
import StoryService from '../services/story.service';
class UserService {
	public users = userModel;
	private story = Story;

	public redis = redisDb;
	public storyService = new StoryService();
	public async findAllUser(): Promise<User[]> {
		const users: userModel[] = await this.users.find();
		return users;
	}

	public async findUserById(userId: number): Promise<User> {
		const findUser = await this.users.findOne({
			where: { id: userId },
			order: {
				createdAt: 'DESC',
			},
		});
		if (!findUser) throw new HttpException(409, "You're not user");
		return findUser;
	}

	public async getAllUserStory(userId: string): Promise<StoryInterface[]> {
		const userStories: Story[] = await this.story.find({
			where: { creatorId: userId },
			relations: ['creator', 'tags'],
			order: { createdAt: 'DESC' },
		});
		return this.storyService.pruneStory(userStories);
	}

	public async createUser(userData: CreateUserDto): Promise<User> {
		if (isEmptyObject(userData))
			throw new HttpException(400, "You're not userData");

		const findUser = await this.users.findOne({
			where: { email: userData.email },
		});
		if (findUser)
			throw new HttpException(
				409,
				`You're email ${userData.email} already exists`
			);

		const hashedPassword = await bcrypt.hash(userData.password, 10);
		const createUserData = {
			id: String(this.users.length + 1),
			...userData,
			password: hashedPassword,
		};

		return createUserData;
	}

	public async updateUser(
		userId: string,
		userData: UpdateProfileDto
	): Promise<any> {
		if (isEmptyObject(userData))
			throw new HttpException(400, "You're not userData");

		const findUser = this.users.findOne({ where: { id: userId } });
		if (!findUser) throw new HttpException(409, "You're not user");
		const {
			firstname,
			lastname,
			profileimage,
			username,
			coverimage,
		} = userData;
		await this.users.update(userId, {
			firstname,
			lastname,
			profileimage,
			username,
			coverimage,
		});
		const updatedUser = await this.users.findOne(userId);
		return updatedUser;
	}

	public async changePassword({
		id,
		newPassword,
		oldPassword,
	}: {
		id: string;
		newPassword: string;
		oldPassword: string;
	}): Promise<boolean> {
		const findUser = await this.users.findOne({ where: { id } });
		if (!findUser) {
			throw new HttpException(
				404,
				`user is either not loggedin or does not exist`
			);
		}

		const isPasswordMatching: boolean = await bcrypt.compare(
			oldPassword,
			findUser.password
		);
		if (!isPasswordMatching) throw new HttpException(409, 'wrong old password');

		const hashedPassword = await bcrypt.hash(newPassword, 10);
		await this.users.update(id, { password: hashedPassword });
		return true;
	}
	public async deleteUser(userId: string): Promise<boolean> {
		const findUser = await this.users.find({ where: { id: userId } });
		if (!findUser) throw new HttpException(409, 'user does not exist');
		await this.users.delete(userId);
		return true;
	}
	public async sendVerifyUserEmail(email) {
		const findUser = await this.users.findOne({ where: { email } });
		if (!findUser) throw new HttpException(404, 'user not found');
		const token = await this.cacheVerifiedPwd(findUser.id);

		await sendMessage(findUser.email, 'verifyemail', token);
		return true;
	}
	static removeUserData(arr) {
		const newUserStory = arr.map((story) => {
			const { username, profileimage } = story.creator;

			return (story = {
				...story,
				creator: {
					username,
					profileimage,
				},
			});
		});
		return newUserStory;
	}
	public async verifyUser(token) {
		const userId = await this.redis.get(token);
		if (!userId)
			throw new HttpException(404, 'user no longer exist or token expired');
		const user = await this.users.findOne(userId);
		if (!user)
			throw new HttpException(404, 'user no longer exist or token expired');
		await this.users.update(
			{
				id: userId,
			},
			{
				verified: true,
			}
		);

		return true;
	}
	public async cacheVerifiedPwd(id) {
		const token = v4();
		const key = token;
		const time = 1000 * 60 * 60 * 24 * 1;
		if (__prod__) {
			await this.redis.set(key, id, 'ex', time);
		} else {
			await this.redis.set(key, id);
		}
		return token;
	}
}

export default UserService;
