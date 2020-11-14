import { Router } from 'express';
import Route from '../interfaces/routes.interface';
import ReportController from '../controllers/report.controller';
import validationMiddleware from '../middlewares/validation.middleware';
import authMiddleware from '../middlewares/auth.middleware';

import {
	// ReportCommentDto,
	// ReportReplyDto,
	ReportStoryDto,
} from '../dtos/report.dto';
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
	}
}

export default ReportRoute;
