/* -------------------------------------------------------------------------- */
/*                            External Dependencies                           */
/* -------------------------------------------------------------------------- */
import * as jwt from 'jsonwebtoken';

/* -------------------------- Internal Dependencies ------------------------- */

import HttpException from '../exceptions/HttpException';
import { DataStoredInToken } from '../interfaces/auth.interface';
import { UserModel } from '../models/users.model';
import { JWT_SECRET } from '../config';
import { RequestWithUser } from '../interfaces/auth.interface';

async function authMiddleware(req: RequestWithUser, _, next) {
	const token = req.header('x-auth-token');
	if (token) {
		const secret = JWT_SECRET;
		try {
			const verificationResponse = jwt.verify(
				token,
				secret
			) as DataStoredInToken;
			const userId = verificationResponse.id;
			const findUser = await UserModel.findOne({ where: { id: userId } });
			if (findUser) {
				req.user = findUser;
				next();
			} else {
				next(new HttpException(401, 'Error, Please Login '));
			}
		} catch (error) {
			next(new HttpException(401, 'Something Went wrong'));
		}
	} else {
		next(new HttpException(404, 'Please Login '));
	}
	// return next(new HttpException(404, 'something went wrong'));
}

export default authMiddleware;
