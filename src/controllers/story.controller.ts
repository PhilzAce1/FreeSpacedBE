import { NextFunction, Request, Response } from "express"
import StoryService from "../services/story.service"
import { CreateStoryDto } from '../dtos/story.dto'
import UserService from '../services/users.service'
class StoryController {
    public storyService = new StoryService()
    public userService = new UserService()
    public getAllStories = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await this.storyService.getAllStories()
            res.status(200).json({
                success: true,
                data
            })
        } catch (error) {
            next(error)
        }
    }
    public createPost = async (req: Request, res: Response, next: NextFunction) => {
        const storyData: CreateStoryDto = req.body

        if (!storyData.creatorId) {
            storyData.creatorId = await this.userService.createAnonUser()
        }
        try {
            const createdStory = await this.storyService.createStory(storyData)
            res.status(200).json({
                data: createdStory,
                message: "storyCreated"
            })
        } catch (error) {
            next(error)
        }


    }
}
export default StoryController