import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { CreateUserDto } from '../dtos/users.dto';
import HttpException from '../exceptions/HttpException';
import { DataStoredInToken, TokenData } from '../interfaces/auth.interface';
import { User } from '../interfaces/users.interface';
import { UserModel as userModel } from '../models/users.model';
import { isEmptyObject } from '../utils/util';
import { JWT_SECRET, FORGET_PASSWORD_PREFIX, __prod__ } from '../config';
import { sendMessage } from '../utils/sendMail';
import { v4 } from 'uuid';
import { redisDb } from '../utils/connectDB';
import { createIdenticon } from '../utils/genImage';
import { ImageUrl } from '../config';
import UserService from './users.service';
class AuthService {
	public users = userModel;
	public redis = redisDb;
	private userService = new UserService();
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
		const generatedUsername = await this.genUsername();
		const generatedImage = createIdenticon();
		const createUserData: User = {
			email: userData.email,
			username: generatedUsername,
			password: hashedPassword,
			profileimage: ImageUrl + generatedImage,
		};
		const res = await this.users.create(createUserData).save();
		const tokenData = this.createToken(res);
		const cookie = this.createCookie(tokenData);

		await this.userService.sendVerifyUserEmail(userData.email);

		return { cookie, findUser: res, token: tokenData.token };
	}

	public async createAnonUser() {
		const username = await this.genUsername();
		const generatedImage = createIdenticon();
		const newUser = await this.users
			.create({ username, profileimage: ImageUrl + generatedImage })
			.save();
		return newUser.id;
	}

	public async genUsername(): Promise<string> {
		const randomInt: string = Math.floor(100 + Math.random() * 900).toString();
		const username = 'anon' + randomInt;
		const userExist = await this.users.findOne({
			where: { username: username },
		});
		if (!userExist) {
			return username;
		} else {
			return this.genUsername();
		}
	}
	public async updateAnonUser(
		userData
	): Promise<{ cookie: string; findUser: User; token: string }> {
		if (isEmptyObject(userData))
			throw new HttpException(400, "You're not userData");

		const userExist = await this.users.findOne({
			where: { id: userData.userId },
		});
		if (!userExist) {
			return this.signup(userData);
		}
		if (userExist && userExist.email !== null) {
			throw new HttpException(400, 'User already exist');
		}
		const userWithEmailExist = await this.users.findOne({
			where: { email: userData.email },
		});
		if (userWithEmailExist) {
			throw new HttpException(409, 'user with this email, already exist');
		}
		const hashedPassword = await bcrypt.hash(userData.password, 10);
		const updateUser = {
			email: userData.email,
			password: hashedPassword,
		};
		await this.users.update(
			{
				id: userData.userId,
			},
			updateUser
		);
		const tokenData = this.createToken({ ...updateUser, id: userData.userId });
		const cookie = this.createCookie(tokenData);
		const newUser = await this.users.findOne({
			where: { email: userData.email },
		});
		const findUser = {
			id: newUser?.id,
			email: newUser?.email,
			username: newUser?.username,
			role: newUser?.role,
			verified: newUser?.verified,
			profileimage: newUser?.profileimage,
		};
		await this.userService.sendVerifyUserEmail(userData.email);
		return { cookie, findUser, token: tokenData.token };
	}

	public async login(
		userData: CreateUserDto
	): Promise<{ cookie: string; findUser: User; token: string }> {
		if (isEmptyObject(userData))
			throw new HttpException(400, `Invalid email or password`);

		const findUser = await this.users.findOne({
			where: { email: userData.email },
		});
		if (!findUser) throw new HttpException(409, `Invalid email or password`);

		const isPasswordMatching: boolean = await bcrypt.compare(
			userData.password,
			findUser.password
		);
		if (!isPasswordMatching)
			throw new HttpException(409, `Invalid email or password`);

		const tokenData = this.createToken(findUser);
		const cookie = this.createCookie(tokenData);

		findUser.password = '';

		return { cookie, findUser, token: tokenData.token };
	}

	public async forgotPassword(email: string): Promise<boolean> {
		const findUser = await this.users.findOne({ where: { email } });
		if (!findUser) {
			throw new HttpException(404, 'email not found please check again');
		}
		const token = await this.cacheForgotPassword(findUser.id);
		// const link =  token;
		// send Email
		await sendMessage(findUser.email, 'forgotpassword', token);
		return true;
	}
	public async logout(userData: User): Promise<User> {
		if (isEmptyObject(userData))
			throw new HttpException(400, "You're not logged in");

		const findUser = await this.users.findOne({
			where: { email: userData.email },
		});
		if (!findUser) throw new HttpException(409, 'User does not exist');

		return findUser;
	}
	public async changePassword(token, newPassword) {
		const key = FORGET_PASSWORD_PREFIX + token;
		const userId = await this.redis.get(key);
		if (!userId) throw new HttpException(404, 'Token expired or invalid');

		const user = await this.users.findOne(userId);

		if (!user) throw new HttpException(404, 'User no longer exist');
		const hashedPassword = await bcrypt.hash(newPassword, 10);

		await this.users.update(
			{
				id: userId,
			},
			{
				password: hashedPassword,
			}
		);
		await this.redis.del(key);
		const tokenData = this.createToken(user);
		const cookie = this.createCookie(tokenData);

		return { user, cookie };
	}
	public async cacheForgotPassword(id) {
		const token = v4();
		const key = FORGET_PASSWORD_PREFIX + token;
		const time = 60 * 60 * 1;
		//
		await this.redis.set(key, id, 'ex', time);
		return token;
	}
	public createToken(user: User): TokenData {
		const dataStoredInToken: DataStoredInToken = { id: user.id };
		const secret: string = JWT_SECRET;
		const expiresIn: number = 1000 * 60 * 60 * 24 * 30; // 50 days;

		return {
			expiresIn,
			token: jwt.sign(dataStoredInToken, secret, { expiresIn }),
		};
	}

	public createCookie(tokenData: TokenData): string {
		return `Authorization=${tokenData.token};  Max-Age=${tokenData.expiresIn};`;
	}
}
// HttpOnly;

export default AuthService;
