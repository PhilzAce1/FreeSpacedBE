/* -------------------------------------------------------------------------- */
/*                            External Dependencies                           */
/* -------------------------------------------------------------------------- */
import * as jwt from 'jsonwebtoken';

/* -------------------------- Internal Dependencies ------------------------- */

import HttpException from '../exceptions/HttpException';
import { DataStoredInToken } from '../interfaces/auth.interface';
import { UserModel } from '../models/users.model';
import { JWT_SECRET } from '../config';

async function authMiddleware(req, _, next) {
	const cookies = req.cookies;
	if (cookies && cookies.Authorization) {
		const secret = JWT_SECRET;
		try {
			const verificationResponse = jwt.verify(
				cookies.Authorization,
				secret
			) as DataStoredInToken;
			const userId = verificationResponse.id;
			const findUser = await UserModel.findOne({ where: { id: userId } });
			if (findUser) {
				req.user = findUser;
				next();
			} else {
				next(new HttpException(401, 'Wrong authentication token'));
			}
		} catch (error) {
			next(new HttpException(401, 'Wrong authentication token'));
		}
	} else {
		next(new HttpException(404, 'Authentication token missing'));
	}
	// return next(new HttpException(404, 'something went wrong'));
}

export default authMiddleware;
