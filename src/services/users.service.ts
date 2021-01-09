import * as bcrypt from 'bcrypt';
import {
	CreateUserDto,
	UpdateProfileDto,
	UpdateUserEmailDto,
} from '../dtos/users.dto';
import HttpException from '../exceptions/HttpException';
import { User } from '../interfaces/users.interface';
import { UserModel as userModel } from '../models/users.model';
import { isEmptyObject } from '../utils/util';
import { __prod__ } from '../config';
import { redisDb } from '../utils/connectDB';
import { v4 } from 'uuid';
import { sendMessage } from '../utils/sendMail';
import { Story } from '../models/story.model';
import { mapActionUser } from '../utils/helpers';
import { Story as StoryInterface } from '../interfaces/story.interface';
import { Notification } from '../models/notification.model';
import StoryService from '../services/story.service';
import { mapContributors } from '../utils/helpers';
class UserService {
	public users = userModel;
	private story = Story;
	private notification = Notification;

	public redis = redisDb;
	public storyService = new StoryService();
	public async findAllUser(): Promise<User[]> {
		const users: userModel[] = await this.users.find();
		return users;
	}

	public async updateEmail(
		userData: UpdateUserEmailDto,
		userId: string
	): Promise<string> {
		const emailExist = await this.users.findOne({
			where: { email: userData.email },
		});
		if (emailExist) throw new HttpException(409, 'email exist');
		await this.users.update(userId, { email: userData.email });
		return userData.email;
	}
	public async findUserById(userId): Promise<User> {
		const findUser = await this.users.findOne({
			where: { id: userId },
			order: {
				createdAt: 'DESC',
			},
			relations: ['stories'],
		});
		if (!findUser) throw new HttpException(409, "You're not user");
		return findUser;
	}
	public sortNotifcations(arr) {
		const newArr = arr.sort((a, b) => {
			const first = new Date(a.createdAt);
			const second = new Date(b.createdAt);
			const firstDate = first.getTime();
			const lastDate = second.getTime();
			return lastDate - firstDate;
		});
		return newArr;
	}
	public async getUserNofications(userId) {
		const findUser = await this.users.findOne({
			where: { id: userId },
			order: {
				createdAt: 'DESC',
			},
			relations: ['notifications', 'notifications.actionuser'],
		});
		if (!findUser) throw new HttpException(409, "You're not user");
		const { notifications } = findUser;

		const actionUserMapped = mapActionUser(notifications);

		return {
			unread: notifications.filter((x) => x.read === false).length,
			count: notifications.length,
			notifications: this.sortNotifcations(actionUserMapped),
		};
	}
	public async markAllNotificationAsRead(userId) {
		const findUser = await this.users.findOne({
			where: { id: userId },
			order: {
				createdAt: 'DESC',
			},
			relations: ['notifications', 'notifications.actionuser'],
		});
		if (!findUser) throw new HttpException(409, "You're not user");
		const { notifications } = findUser;
		if (notifications.length > 0) {
			notifications.map((data) => {
				if (data.read === false) {
					this.updateNotificationToRead(data.id);
					data.read = true;
				}
				return data;
			});
		}
		const actionUserMapped = mapActionUser(notifications);

		return {
			unread: notifications.filter((x) => x.read === false).length,
			count: notifications.length,
			notifications: this.sortNotifcations(actionUserMapped),
		};
	}
	public async updateNotificationToRead(notifcationId) {
		const findUser = await this.notification.update(notifcationId, {
			read: true,
		});
		if (!findUser) throw new HttpException(409, "You're not user");
		return findUser;
	}
	public async getAllUserStory(userId: string): Promise<StoryInterface[]> {
		const userStories: Story[] = await this.story.find({
			where: { creatorId: userId },
			relations: ['tags', 'creator', 'comments', 'comments.creator'],
			order: { createdAt: 'DESC' },
		});

		const mapedContributorStory = mapContributors(
			this.storyService.pruneStory(userStories)
		);

		return mapedContributorStory;
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

		const {
			firstname,
			lastname,
			profileimage,
			username,
			coverimage,
		} = userData;
		const findUser = await this.users.findOne({ where: { id: userId } });
		if (!findUser) throw new HttpException(409, "You're not user");
		const usernameExist = await this.users.findOne({ where: { username } });

		if (userId !== usernameExist?.id && usernameExist?.username === username) {
			throw new HttpException(409, 'A user with this username already exist');
		}
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
