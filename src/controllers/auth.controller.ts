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
				const { findUser, token } = await this.authService.updateAnonUser(
					userData
				);
				const { password, ...createdUser } = findUser;

				const resData = {
					email: createdUser.email,
					token,
					role: createdUser.role,
					username: createdUser.username,
					id: createdUser.id,
					profileimage: createdUser.profileimage,
				};
				res.status(201).json({ payload: resData, success: true });
			} else {
				const { findUser, token } = await this.authService.signup(userData);
				const { password, ...createdUser } = findUser;
				const resData = {
					email: createdUser.email,
					token,
					username: createdUser.username,
					role: createdUser.role,
					profileimage: createdUser.profileimage,
					id: createdUser.id,
				};

				res.status(201).json({ payload: resData, success: true });
			}
		} catch (error) {
			next(error);
		}
	};

	public logIn = async (req: Request, res: Response, next: NextFunction) => {
		const userData: CreateUserDto = req.body;

		try {
			const { findUser, token } = await this.authService.login(userData);
			const { password, ...loggedInUser } = findUser;
			const resData = {
				email: loggedInUser.email,
				token,
				role: loggedInUser.role,
				username: loggedInUser.username,
				profileimage: loggedInUser.profileimage,
				id: loggedInUser.id,
			};

			res
				.header('x-auth-token', 'Somethingnice')
				.status(200)
				.json({ payload: resData, success: true });
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
			res.status(200).json({
				success: true,
				payload: { message: 'password recovery email sent' },
			});
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
			const { user } = await this.authService.changePassword(
				token,
				newPassword
			);
			const { password, ...loggedInUser } = user;

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
			res.status(200).json({
				payload: {
					message: `${logOutUserData.email} has been logged out successfully`,
				},
				success: true,
			});
		} catch (error) {
			next(error);
		}
	};
}

export default AuthController;
