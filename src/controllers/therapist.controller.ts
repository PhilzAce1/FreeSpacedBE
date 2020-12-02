/* -------------------------- External Dependencies ------------------------- */
import { NextFunction, Request, Response } from 'express';
// import HttpException from '../exceptions/HttpException';

/* -------------------------- Validators and Interfaces  ------------------------- */
import { CreateUserDto, UpdateUserEmailDto } from '../dtos/users.dto';
/* -------------------------- Internal Dependencies ------------------------- */
import TherapistService from '../services/therapist.service';
class TherapistController {
	private therapistService = new TherapistService();
	public signup = async (req: Request, res: Response, next: NextFunction) => {
		const userData: CreateUserDto = req.body;
		try {
			const { findUser, token } = await this.therapistService.signup(userData);
			const resData = {
				email: findUser.email,
				token,
				username: findUser.username,
				role: findUser.role,
				profileimage: findUser.profileimage,
				id: findUser.id,
			};
			res.status(200).json({
				success: true,
				payload: resData,
			});
		} catch (error) {
			next(error);
		}
	};
	public addWaitlist = async (
		req: Request,
		res: Response,
		next: NextFunction
	) => {
		const userData: UpdateUserEmailDto = req.body;
		try {
			const data = await this.therapistService.addWaitlist(userData);
			res.status(200).json({
				success: true,
				payload: data,
			});
		} catch (error) {
			next(error);
		}
	};
}

export default TherapistController;
