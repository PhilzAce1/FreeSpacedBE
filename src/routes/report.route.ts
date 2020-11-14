import { Router } from 'express';
import Route from '../interfaces/routes.interface';

class ReportRoute implements Route {
	public path = '/report';
	public router = Router();

	constructor() {
		this.initializeRoute();
	}
	private initializeRoute() {}
}

export default ReportRoute;
