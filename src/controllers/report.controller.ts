import { Request, Response, NextFunction } from 'express';

import ReportService from '../services/report.service';
// import HttpException from '../exceptions/HttpException';
class ReportController {
	public reportSevice = new ReportService();
	public init = async (_: Request, res: Response, next: NextFunction) => {
		try {
			const data = await this.reportSevice.init();
			res.status(200).json({
				success: true,
				payload: data,
			});
		} catch (error) {
			next(error);
		}
	};
}
export default ReportController;
