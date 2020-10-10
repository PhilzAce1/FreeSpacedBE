import { NextFunction, Request, Response } from 'express';
import { nextTick } from 'process';
import { CreateUserDto } from '../dtos/users.dto';
import { RequestWithUser } from '../interfaces/auth.interface';
import { User } from '../interfaces/users.interface';
import AuthService from '../services/auth.service';

class AuthController {
  public authService = new AuthService();

  public signUp = async (req: Request, res: Response, next: NextFunction) => {
    const userData: CreateUserDto = req.body;

    try {
      const signUpUserData: User = await this.authService.signup(userData);
      signUpUserData.password = '';
      res.status(201).json({ data: signUpUserData, message: 'signup' });
    } catch (error) {
      next(error);
    }
  };

  public logIn = async (req: Request, res: Response, next: NextFunction) => {
    const userData: CreateUserDto = req.body;

    try {
      const { cookie, findUser } = await this.authService.login(userData);
      res.setHeader('Set-Cookie', [cookie]);
      res.status(200).json({ data: findUser, message: 'login' });
    } catch (error) {
      next(error);
    }
  };

  public forgotPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const email: string = req.body;

    try {
      const success = await this.authService.forgotPassword(email);

      res.status(200).json({ message: 'password has been changed' });
    } catch (error) {
      next(error);
    }
  };
  public logOut = async (
    req: RequestWithUser,
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
