import { NextFunction, Request, Response } from 'express';
import { nextTick } from 'process';
import { CreateUserDto } from '../dtos/users.dto';
import { RequestWithUser } from '../interfaces/auth.interface';
import { User } from '../interfaces/users.interface';
import AuthService from '../services/auth.service';
import UserService from '../services/users.service'
class AuthController {
  public authService = new AuthService();
  public signUp = async (req: Request, res: Response, next: NextFunction) => {
    const userData: CreateUserDto = req.body;
    try {
      let signUpUserData: User

      if (userData.userId) {
        signUpUserData = await this.authService.updateAnonUser(userData)
      } else {
        signUpUserData = await this.authService.signup(userData);
      }

      const { password, ...createdUser } = signUpUserData
      res.status(201).json({ data: createdUser, message: 'signup' });
    } catch (error) {
      next(error);
    }
  };

  public logIn = async (req: Request, res: Response, next: NextFunction) => {
    const userData: CreateUserDto = req.body;

    try {
      const { cookie, findUser } = await this.authService.login(userData);
      const { password, ...loggedInUser } = findUser

      res.setHeader('Set-Cookie', [cookie]);
      res.status(200).json({ data: loggedInUser, message: 'login' });
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
      res.status(200).json({ message: 'password email sents' });
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
    const { token, newPassword } = req.body
    try {
      const { cookie, user } = await this.authService.changePassword(token, newPassword)
      const { password, ...loggedInUser } = user
      res.setHeader('Set-Cookie', [cookie]);
      res.status(200).json({ data: loggedInUser, message: 'login' });
    } catch (error) {
      next(error)
    }
  }
  public logOut = async (
    req,
    res: Response,
    next: NextFunction
  ) => {
    const userData: User = req.user;

    try {
      const logOutUserData: User = await this.authService.logout(userData);
      res.setHeader('Set-Cookie', ['Authorization=; Max-age=0']);
      res.status(200).json({ data: logOutUserData, message: 'logout' });
    } catch (error) {
      next(error);
    }
  };
}

export default AuthController;
