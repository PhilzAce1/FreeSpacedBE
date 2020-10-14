// import { } from 'express'
import { Router } from 'express'
import Route from '../interfaces/routes.interface'
import StoryController from '../controllers/story.controller'
import validationMiddleware from '../middlewares/validation.middleware'
import { CreateStoryDto } from '../dtos/story.dto'
class StoryRoute implements Route {
    public path = '/story'
    public router = Router()
    public storyController = new StoryController
    constructor() {
        this.initializeRoutes()
    }
    private initializeRoutes() {
        this.router.get(`${this.path}`, this.storyController.getAllStories)

        this.router.post(`${this.path}/create`, validationMiddleware(CreateStoryDto), this.storyController.createPost)
    }
}
export default StoryRoute