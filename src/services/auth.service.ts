import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { CreateUserDto } from '../dtos/users.dto';
import HttpException from '../exceptions/HttpException';
import { DataStoredInToken, TokenData } from '../interfaces/auth.interface';
import { User } from '../interfaces/users.interface';
import { userReModel as userModel } from '../models/users.model';
import { isEmptyObject } from '../utils/util';
import { JWT_SECRET } from '../config';
import { sendMessage } from '../utils/sendMail';
class AuthService {
  public users = userModel;

  public async signup(userData: CreateUserDto): Promise<User> {
    if (isEmptyObject(userData))
      throw new HttpException(400, "You're not userData");

    const findUser = await this.users.findOne({
      where: { email: userData.email },
    });
    if (findUser)
      throw new HttpException(
        409,
        `You're email ${userData.email} already exists`
      );

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const createUserData: User = {
      ...userData,
      password: hashedPassword,
    };
    await this.users.create(createUserData).save();
    delete createUserData.password;
    return createUserData;
  }

  public async login(
    userData: CreateUserDto
  ): Promise<{ cookie: string; findUser: User }> {
    if (isEmptyObject(userData))
      throw new HttpException(400, "You're not userData");

    const findUser = await this.users.findOne({
      where: { email: userData.email },
    });
    if (!findUser)
      throw new HttpException(409, `You're email ${userData.email} not found`);

    const isPasswordMatching: boolean = await bcrypt.compare(
      userData.password,
      findUser.password
    );
    if (!isPasswordMatching)
      throw new HttpException(409, "You're password not matching");

    const tokenData = this.createToken(findUser);
    const cookie = this.createCookie(tokenData);

    findUser.password = '';

    return { cookie, findUser };
  }
  public async forgotPassword(email: string): Promise<boolean> {
    const findUser = await this.users.findOne({ where: { email } });
    if (!findUser) {
      throw new HttpException(404, 'email not found please check again');
    }
    const newPassword: string = Math.random().toString(36).slice(5);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.users.update({ id: findUser.id }, { password: hashedPassword });
    await sendMessage(findUser.email, newPassword);

    return true;
  }
  public async logout(userData: User): Promise<User> {
    if (isEmptyObject(userData))
      throw new HttpException(400, "You're not userData");

    const findUser = await this.users.findOne({
      where: { email: userData.email },
    });
    if (!findUser) throw new HttpException(409, "You're not user");

    return findUser;
  }

  public createToken(user: User): TokenData {
    const dataStoredInToken: DataStoredInToken = { id: user.id };
    const secret: string = JWT_SECRET;
    const expiresIn: number = 60 * 60;

    return {
      expiresIn,
      token: jwt.sign(dataStoredInToken, secret, { expiresIn }),
    };
  }

  public createCookie(tokenData: TokenData): string {
    return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn};`;
  }
}

export default AuthService;
