/**============External Dependecies============================ */
import { Router } from 'express';
/**--------------Interface, dtos and validation------------------ */
import {
	CreateUserDto,
	ChangePasswordDto,
	UpdateProfileDto,
	UpdateUserEmailDto,
} from '../dtos/users.dto';
import Route from '../interfaces/routes.interface';
/**-------------Internal dependencies --------------------------- */
import validationMiddleware from '../middlewares/validation.middleware';
import authMiddleware from '../middlewares/auth.middleware';
import UsersController from '../controllers/users.controller';

class UsersRoute implements Route {
	public path = '/users';
	public router = Router();
	public usersController = new UsersController();

	constructor() {
		this.initializeRoutes();
	}

	private initializeRoutes() {
		this.router.get(`${this.path}`, this.usersController.getUsers);
		// this.router.get(`${this.path}/:id`, this.usersController.getUserById);
		// todo - write docs
		this.router.get(
			`${this.path}/story/:userId`,
			this.usersController.getUserStories
		);
		this.router.get(
			`${this.path}/story/`,
			authMiddleware,
			this.usersController.getAuthUserStoried
		);
		this.router.get(
			`${this.path}/notifications`,
			authMiddleware,
			this.usersController.getUserNotifications
		);
		this.router.post(
			`${this.path}`,
			validationMiddleware(CreateUserDto),
			this.usersController.createUser
		);
		this.router.post(
			`${this.path}/sendverifyemail`,
			this.usersController.sendVerifyEmail
		);
		this.router.post(
			`${this.path}/verifyuser`,
			this.usersController.verifyUser
		);
		this.router.put(
			`${this.path}/updateprofile`,
			validationMiddleware(UpdateProfileDto),
			authMiddleware,
			this.usersController.updateUser
		);
		this.router.put(
			`${this.path}/changepassword`,
			validationMiddleware(ChangePasswordDto),
			authMiddleware,
			this.usersController.changePassword
		);
		this.router.put(
			`${this.path}/changeemail`,
			validationMiddleware(UpdateUserEmailDto),
			authMiddleware,
			this.usersController.changeUserEmail
		);
		this.router.put(
			`${this.path}/notification`,
			authMiddleware,
			this.usersController.updateNotification
		);
		this.router.delete(
			`${this.path}/`,
			authMiddleware,
			this.usersController.deleteUser
		);
	}
}

export default UsersRoute;
