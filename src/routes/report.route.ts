import { Router } from 'express';
import Route from '../interfaces/routes.interface';
import ReportController from '../controllers/report.controller';
class ReportRoute implements Route {
	public path = '/report';
	public router = Router();
	public reportController = new ReportController();

	constructor() {
		this.initializeRoute();
	}
	private initializeRoute() {
		this.router.get(`${this.path}`, this.reportController.init);
	}
}

export default ReportRoute;
