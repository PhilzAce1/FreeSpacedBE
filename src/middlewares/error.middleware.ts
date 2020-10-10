import { NextFunction, Request, Response } from 'express';
import HttpException from '../exceptions/HttpException';

function errorMiddleware(
  error: HttpException,
  __: Request,
  res: Response,
  _: NextFunction
) {
  const status: number = error.status || 500;
  const message: string = error.message || 'Something went wrong';

  console.error('[ERROR] ', status, message);

  res.status(status).json({ message });
}

export default errorMiddleware;
