import { Router } from 'express';
import { CreateUserDto, UpdateUserEmailDto } from '../dtos/users.dto';
import validationMiddleware from '../middlewares/validation.middleware';
import TherapistController from '../controllers/therapist.controller';
import Route from '../interfaces/routes.interface';

class TherapistRoute implements Route {
	public router = Router();
	public path = '/therapist';
	private therapistController = new TherapistController();
	constructor() {
		this.initializeRoutes();
	}

	private initializeRoutes() {
		this.router.post(
			`${this.path}/signup`,
			validationMiddleware(CreateUserDto),
			this.therapistController.signup
		);
		this.router.post(
			`${this.path}/waitlist`,
			validationMiddleware(UpdateUserEmailDto),
			this.therapistController.addWaitlist
		);
	}
}

export default TherapistRoute;
