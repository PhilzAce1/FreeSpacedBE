"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const story_model_1 = require("../models/story.model");
const util_1 = require("../utils/util");
const HttpException_1 = __importDefault(require("../exceptions/HttpException"));
class StoryService {
    constructor() {
        this.story = story_model_1.Story;
    }
    getAllStories() {
        return __awaiter(this, void 0, void 0, function* () {
            const stories = yield this.story.find();
            return stories;
        });
    }
    createStory(storyData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (util_1.isEmptyObject(storyData))
                throw new HttpException_1.default(400, "You have not inputed any Story Data");
            const storyTitleExist = yield this.story.findOne({ where: { title: storyData.title } });
            if (storyTitleExist)
                throw new HttpException_1.default(400, "This Tile Already exist Please change it");
            const { id, title, text, creatorId } = storyData;
            const createdStory = yield this.story.create({
                id, title, text,
                creatorId: parseInt(creatorId)
            });
            return createdStory;
        });
    }
}
exports.default = StoryService;
//# sourceMappingURL=story.service.js.map