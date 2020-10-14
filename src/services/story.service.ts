import { Story as storyModel } from '../models/story.model'
import { Story } from '../interfaces/story.interface'
import { isEmptyObject } from '../utils/util'
import HttpException from '../exceptions/HttpException'
class StoryService {
    public story = storyModel

    public async getAllStories(): Promise<Story[]> {
        const stories = await this.story.find()
        return stories
    }
    // public async getStoryById(storyId: number): Promise<Story> {
    // const singleStory = await this.story.findOne({ where: { id: storyId } })



    // return singleStory
    // }

    public async createStory(storyData): Promise<Story> {
        if (isEmptyObject(storyData))
            throw new HttpException(400, "You have not inputed any Story Data")

        const storyTitleExist = await this.story.findOne({ where: { title: storyData.title } })
        if (storyTitleExist)
            throw new HttpException(400, "This Tile Already exist Please change it")

        const { id, title, text, creatorId } = storyData
        const createdStory = await this.story.create({
            id, title, text,
            creatorId: parseInt(creatorId)
        })
        return createdStory
    }
}

export default StoryService