/* -------------------------- External Dependencies ------------------------- */
import { NextFunction, Request, Response } from 'express';

/* -------------------------- Validators and Interfaces  ------------------------- */
import { CreateUserDto } from '../dtos/users.dto';
import { User } from '../interfaces/users.interface';

/* -------------------------- Internal Dependencies ------------------------- */
import AuthService from '../services/auth.service';
class AuthController {
	public authService = new AuthService();
	public signUp = async (req: Request, res: Response, next: NextFunction) => {
		const userData: CreateUserDto = req.body;
		try {
			if (userData.userId) {
				const {
					cookie,
					findUser,
					token,
				} = await this.authService.updateAnonUser(userData);
				const { password, ...createdUser } = findUser;
				res.setHeader('Set-Cookie', [cookie]);
				const resData = {
					email: createdUser.email,
					token,
					role: createdUser.role,
					username: createdUser.username,
					id: createdUser.id,
				};
				res.status(201).json({ payload: resData, success: true });
			} else {
				const { cookie, findUser, token } = await this.authService.signup(
					userData
				);
				const { password, ...createdUser } = findUser;
				const resData = {
					email: createdUser.email,
					token,
					username: createdUser.username,
					role: createdUser.role,
					id: createdUser.id,
				};
				res.setHeader('Set-Cookie', [cookie]);
				res.status(201).json({ payload: resData, success: true });
			}
		} catch (error) {
			next(error);
		}
	};

	public logIn = async (req: Request, res: Response, next: NextFunction) => {
		const userData: CreateUserDto = req.body;

		try {
			const { cookie, findUser, token } = await this.authService.login(
				userData
			);
			const { password, ...loggedInUser } = findUser;
			const resData = {
				email: loggedInUser.email,
				token,
				role: loggedInUser.role,
				username: loggedInUser.username,
				id: loggedInUser.id,
			};
			res.setHeader('Set-Cookie', [cookie]);
			res.status(200).json({ payload: resData, success: true });
		} catch (error) {
			next(error);
		}
	};

	public forgotPassword = async (
		req: Request,
		res: Response,
		next: NextFunction
	) => {
		const email: string = req.body.email;
		try {
			await this.authService.forgotPassword(email);
			res
				.status(200)
				.json({ success: true, payload: { message: 'password email sent' } });
		} catch (error) {
			next(error);
		}
	};
	public changePassword = async (
		req: Request,
		res: Response,
		next: NextFunction
	) => {
		// Remember to validate
		const { token, newPassword } = req.body;
		try {
			const { cookie, user } = await this.authService.changePassword(
				token,
				newPassword
			);
			const { password, ...loggedInUser } = user;
			res.setHeader('Set-Cookie', [cookie]);
			res.status(200).json({ payload: loggedInUser, success: true });
		} catch (error) {
			next(error);
		}
	};
	public logOut = async (req, res: Response, next: NextFunction) => {
		const userData: User = req.user;

		try {
			const logOutUserData: User = await this.authService.logout(userData);
			res.setHeader('Set-Cookie', ['Authorization=; Max-age=0']);
			res.status(200).json({ payload: logOutUserData, success: true });
		} catch (error) {
			next(error);
		}
	};
}

export default AuthController;
