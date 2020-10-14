import { NextFunction, Request, Response } from 'express';
import HttpException from '../exceptions/HttpException';
import { CreateUserDto } from '../dtos/users.dto';
import { User } from '../interfaces/users.interface';
import userService from '../services/users.service';

class UsersController {
  public userService = new userService();

  public getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const findAllUsersData: User[] = await this.userService.findAllUser();
      res.status(200).json({ data: findAllUsersData, message: 'findAll' });
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
      res.status(200).json({ data: findOneUserData, message: 'findOne' });
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
      res.status(201).json({ data: createUserData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };
  public changePassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { id, newPassword } = req.body;

    try {
      const success: boolean = await this.userService.changePassword({
        id,
        newPassword,
      });
      if (!success) throw new HttpException(404, 'something went wrong');
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
      res.status(200).json({ data: updateUserData, message: 'updated' });
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
  public sendVerifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body
      await this.userService.sendVerifyUserEmail(email)

      res.status(200).json({ message: 'email sent' })

    } catch (error) {
      next(error)

    }
  }
  public verifyUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.body
      await this.userService.verifyUser(token)
      res.status(200).json({ message: 'email sent' })

    } catch (error) {
      next(error)

    }
  }
}

export default UsersController;
