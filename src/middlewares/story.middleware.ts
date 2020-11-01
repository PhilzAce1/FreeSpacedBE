/* -------------------------------------------------------------------------- */
/*                            External Dependencies                           */
/* -------------------------------------------------------------------------- */
import { NextFunction, Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';

/* -------------------------- Internal Dependencies ------------------------- */
import HttpException from '../exceptions/HttpException';
import { DataStoredInToken } from '../interfaces/auth.interface';

async function storyMiddleware(req: Request, _, next: NextFunction) {
	const token = req.header('x-auth-token');
	if (token) {
		const secret = JWT_SECRET;
		try {
			const verificationResponse = jwt.verify(
				token,
				secret
			) as DataStoredInToken;
			const userId = verificationResponse.id;
			req.body.creatorId = userId;
			next();
		} catch (error) {
			next(new HttpException(401, 'Wrong authentication token'));
		}
	} else {
		next();
	}
}
export default storyMiddleware;
