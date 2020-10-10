import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../dtos/users.dto';
import HttpException from '../exceptions/HttpException';
import { User } from '../interfaces/users.interface';
import { userReModel as userModel } from '../models/users.model';
import { isEmptyObject } from '../utils/util';

class UserService {
  public users = userModel;

  public async findAllUser(): Promise<User[]> {
    const users: userModel[] = await this.users.find();
    return users;
  }

  public async findUserById(userId: number): Promise<User> {
    const findUser = await this.users.findOne({ where: { id: userId } });
    if (!findUser) throw new HttpException(409, "You're not user");
    return findUser;
  }

  public async createUser(userData: CreateUserDto): Promise<User> {
    if (isEmptyObject(userData))
      throw new HttpException(400, "You're not userData");

    const findUser = this.users.find({ where: { email: userData.email } });
    if (findUser)
      throw new HttpException(
        409,
        `You're email ${userData.email} already exists`
      );

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const createUserData = {
      id: this.users.length + 1,
      ...userData,
      password: hashedPassword,
    };

    return createUserData;
  }

  public async updateUser(userId: number, userData: User): Promise<any> {
    if (isEmptyObject(userData))
      throw new HttpException(400, "You're not userData");

    const findUser = this.users.findOne({ where: { email: userData.email } });
    if (!findUser) throw new HttpException(409, "You're not user");

    // const hashedPassword = await bcrypt.hash(userData.password, 10);
    // const updateUserData = this.users.map((user) => {
    //   if (user.id === findUser.id) {
    //     return user;
    //   }
    //   // user = { id, ...userData, password: hashedPassword };
    //   return user;
    // });

    return findUser;
  }

  public async changePassword({ id, newPassword }): Promise<boolean> {
    const findUser = await this.users.findOne({ where: { id } });
    if (!findUser) {
      throw new HttpException(
        404,
        `user is either not loggedin or does not exist`
      );
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.users.update(id, { password: hashedPassword });
    return true;
  }
  public async deleteUser(userId: number): Promise<User[]> {
    const findUser = await this.users.find({ where: { id: userId } });
    if (!findUser) throw new HttpException(409, "You're not user");

    const deleteUserData = await this.users.delete(userId);
    return findUser;
  }
}

export default UserService;
