/* -------------------------- External Dependencies ------------------------- */
import { NextFunction, Request, Response } from 'express';

/* -------------------------- Validators and Interfaces  ------------------------- */
import { CreateUserDto } from '../dtos/users.dto';
import { User } from '../interfaces/users.interface';

/* -------------------------- Internal Dependencies ------------------------- */
import HttpException from '../exceptions/HttpException';
import userService from '../services/users.service';
import { RequestWithUser } from '../interfaces/auth.interface';
class UsersController {
	public userService = new userService();

	public getUsers = async (_: Request, res: Response, next: NextFunction) => {
		try {
			const findAllUsersData: User[] = await this.userService.findAllUser();
			res.status(200).json({ payload: findAllUsersData, success: true });
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
		const userId: number = Number(req.params.id);

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
		console.log('oldPassword', oldPassword);

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
		req: Request,
		res: Response,
		next: NextFunction
	) => {
		const userId: number = Number(req.params.id);
		const userData: User = req.body;

		try {
			const updateUserData: User = await this.userService.updateUser(
				userId,
				userData
			);
			res.status(200).json({ payload: updateUserData, success: true });
		} catch (error) {
			next(error);
		}
	};

	public deleteUser = async (
		req: Request,
		res: Response,
		next: NextFunction
	) => {
		const userId: number = Number(req.params.id);

		try {
			const deleteUserData: User[] = await this.userService.deleteUser(userId);
			res.status(200).json({ data: deleteUserData, message: 'deleted' });
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
