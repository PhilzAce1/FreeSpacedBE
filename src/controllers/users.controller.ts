/* -------------------------- External Dependencies ------------------------- */
import { NextFunction, Request, Response } from 'express';

/* -------------------------- Validators and Interfaces  ------------------------- */
import {
	CreateUserDto,
	UpdateProfileDto,
	UpdateUserEmailDto,
} from '../dtos/users.dto';
import { User } from '../interfaces/users.interface';

/* -------------------------- Internal Dependencies ------------------------- */
import HttpException from '../exceptions/HttpException';
import userService from '../services/users.service';
import { RequestWithUser } from '../interfaces/auth.interface';
class UsersController {
	public userService = new userService();

	public changeUserEmail = async (
		req: RequestWithUser,
		res: Response,
		next: NextFunction
	) => {
		try {
			if (req.user?.id === undefined || req.user.email === undefined)
				throw new HttpException(409, 'You need to be logged in');

			const userId = req.user.id;
			const userData: UpdateUserEmailDto = req.body;
			const currentEmail = req.user.email;

			if (currentEmail === userData.email) {
				res.status(200).json({
					success: true,
					payload: {
						message: 'The Email Provided is your current email',
					},
				});
			} else {
				const updatedEmail: string = await this.userService.updateEmail(
					userData,
					userId
				);
				res.status(200).json({
					success: true,
					payload: `email changed to ${updatedEmail}`,
				});
			}
		} catch (error) {
			next(error);
		}
	};
	public getUsers = async (_: Request, res: Response, next: NextFunction) => {
		try {
			const findAllUsersData: User[] = await this.userService.findAllUser();
			res.status(200).json({ payload: findAllUsersData, success: true });
		} catch (error) {
			next(error);
		}
	};

	public getUserNotifications = async (
		req: RequestWithUser,
		res: Response,
		next: NextFunction
	) => {
		try {
			if (req.user?.id === undefined)
				throw new HttpException(403, 'Please login');
			const findAllUsersNotifications = await this.userService.getUserNofications(
				req.user.id
			);
			res
				.status(200)
				.json({ payload: findAllUsersNotifications, success: true });
		} catch (error) {
			next(error);
		}
	};
	public updateNotification = async (
		req: RequestWithUser,
		res: Response,
		next: NextFunction
	) => {
		try {
			if (req.user?.id === undefined)
				throw new HttpException(403, 'Please login');
			const findAllUsersNotifications = await this.userService.markAllNotificationAsRead(
				req.user.id
			);
			res
				.status(200)
				.json({ payload: findAllUsersNotifications, success: true });
		} catch (error) {
			next(error);
		}
	};

	public getUserStories = async (
		req: Request,
		res: Response,
		next: NextFunction
	) => {
		const userId: string = req.params.userId;
		try {
			const userStory = await this.userService.getAllUserStory(userId);
			res.json({ success: true, payload: userStory });
		} catch (error) {
			next(error);
		}
	};
	public getUserById = async (
		req: Request,
		res: Response,
		next: NextFunction
	) => {
		const userId = req.params.id;

		try {
			const findOneUserData: User = await this.userService.findUserById(userId);
			res.status(200).json({ payload: findOneUserData, success: true });
		} catch (error) {
			next(error);
		}
	};
	/**
	 * getAuthUserStoried
	 */
	public getAuthUserStoried = async (
		req: RequestWithUser,
		res: Response,
		next: NextFunction
	) => {
		try {
			const userId: string = String(req.user?.id);
			const userStories = await this.userService.getAllUserStory(userId);
			res.json({ success: true, payload: userStories });
		} catch (error) {
			next(error);
		}
	};
	public createUser = async (
		req: Request,
		res: Response,
		next: NextFunction
	) => {
		const userData: CreateUserDto = req.body;

		try {
			const createUserData: User = await this.userService.createUser(userData);
			res.status(201).json({ payload: createUserData, success: true });
		} catch (error) {
			next(error);
		}
	};
	public changePassword = async (
		req: RequestWithUser,
		res: Response,
		next: NextFunction
	) => {
		if (req.user?.id === undefined) {
			throw new HttpException(403, 'user has to be logged in');
		}
		const id = req.user.id;
		const { newPassword, oldPassword } = req.body;

		try {
			const success: boolean = await this.userService.changePassword({
				id,
				newPassword,
				oldPassword,
			});
			if (!success) throw new HttpException(400, 'something went wrong');
			res.status(200).json({ success: true, message: 'password changed' });
		} catch (error) {
			next(error);
		}
	};
	public updateUser = async (
		req: RequestWithUser,
		res: Response,
		next: NextFunction
	) => {
		if (req.user?.id === undefined)
			throw new HttpException(
				403,
				'You have to be logged in to update your Profile'
			);
		const userId: string = req.user.id;
		const userData: UpdateProfileDto = req.body;
		try {
			const updateUserData: User = await this.userService.updateUser(
				userId,
				userData
			);
			const { password, ...updatedUserData } = updateUserData;

			res.status(200).json({ payload: updatedUserData, success: true });
		} catch (error) {
			next(error);
		}
	};

	public deleteUser = async (
		req: RequestWithUser,
		res: Response,
		next: NextFunction
	) => {
		if (!req.user?.id) throw new HttpException(400, 'creatorId is required');
		const userId = req.user.id;
		try {
			const userHasBeenDeleted: boolean = await this.userService.deleteUser(
				userId
			);
			if (!userHasBeenDeleted)
				throw new HttpException(400, 'something went wrong');
			res.status(200).json({ message: 'user has been deleted', success: true });
		} catch (error) {
			next(error);
		}
	};
	public sendVerifyEmail = async (
		req: Request,
		res: Response,
		next: NextFunction
	) => {
		try {
			const { email } = req.body;
			await this.userService.sendVerifyUserEmail(email);

			res
				.status(200)
				.json({ success: true, payload: { message: 'email sent' } });
		} catch (error) {
			next(error);
		}
	};
	public verifyUser = async (
		req: Request,
		res: Response,
		next: NextFunction
	) => {
		try {
			const { token } = req.body;
			await this.userService.verifyUser(token);
			res
				.status(200)
				.json({ success: true, payload: { message: 'user verified' } });
		} catch (error) {
			next(error);
		}
	};
}

export default UsersController;
