import { Request, Response, NextFunction } from 'express';
import { RequestWithUser } from 'src/interfaces/auth.interface';
import { ReportCommentDto, ReportStoryDto } from '../dtos/report.dto';

import ReportService from '../services/report.service';
import HttpException from '../exceptions/HttpException';
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
	public reportStory = async (
		req: RequestWithUser,
		res: Response,
		next: NextFunction
	) => {
		try {
			if (req.user?.id === undefined)
				throw new HttpException(
					400,
					' You were not properly authenticated, please Login again'
				);
			const userId = req.user.id;
			const reportStoryData: ReportStoryDto = req.body;
			const data = await this.reportSevice.reportStory(reportStoryData, userId);
			res.status(200).json({
				success: true,
				payload: data,
			});
		} catch (error) {
			next(error);
		}
	};

	public reportComment = async (
		req: RequestWithUser,
		res: Response,
		next: NextFunction
	) => {
		try {
			if (req.user?.id === undefined)
				throw new HttpException(
					400,
					' You were not properly authenticated, please Login again'
				);
			const userId = req.user.id;
			const reportStoryData: ReportCommentDto = req.body;
			const data = await this.reportSevice.reportComment(
				reportStoryData,
				userId
			);
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
