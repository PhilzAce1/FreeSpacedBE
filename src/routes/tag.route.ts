import { Router } from 'express';
import Route from '../interfaces/routes.interface';
import TagController from '../controllers/tag.controller';
class TagRoute implements Route {
	public path = '/tag';
	public router = Router();
	private tagController = new TagController();
	constructor() {
		this.initializeRoute();
	}

	private initializeRoute() {
		this.router.get(`${this.path}`, this.tagController.getAllTags);
	}
}

export default TagRoute;
