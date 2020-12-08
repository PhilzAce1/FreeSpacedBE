/**============External Dependecies============================ */
import { Router } from 'express';

/**--------------Interface, dtos and validation------------------ */
import Route from '../interfaces/routes.interface';
import {
	ReportCommentDto,
	ReportReplyDto,
	ReportStoryDto,
} from '../dtos/report.dto';

/**-------------Internal dependencies --------------------------- */
import ReportController from '../controllers/report.controller';
import validationMiddleware from '../middlewares/validation.middleware';
import authMiddleware from '../middlewares/auth.middleware';

class ReportRoute implements Route {
	public path = '/report';
	public router = Router();
	public reportController = new ReportController();

	constructor() {
		this.initializeRoute();
	}
	private initializeRoute() {
		this.router.get(`${this.path}`, this.reportController.init);
		this.router.post(
			`${this.path}/story`,
			validationMiddleware(ReportStoryDto),
			authMiddleware,
			this.reportController.reportStory
		);
		this.router.post(
			`${this.path}/comment`,
			validationMiddleware(ReportCommentDto),
			authMiddleware,
			this.reportController.reportComment
		);

		this.router.post(
			`${this.path}/reply`,
			validationMiddleware(ReportReplyDto),
			authMiddleware,
			this.reportController.reportReply
		);
	}
}

export default ReportRoute;
