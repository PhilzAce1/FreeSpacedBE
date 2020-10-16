"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const story_controller_1 = __importDefault(require("../controllers/story.controller"));
const validation_middleware_1 = __importDefault(require("../middlewares/validation.middleware"));
const story_dto_1 = require("../dtos/story.dto");
class StoryRoute {
    constructor() {
        this.path = '/story';
        this.router = express_1.Router();
        this.storyController = new story_controller_1.default;
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get(`${this.path}`, this.storyController.getAllStories);
        this.router.post(`${this.path}/create`, validation_middleware_1.default(story_dto_1.CreateStoryDto), this.storyController.createPost);
    }
}
exports.default = StoryRoute;
//# sourceMappingURL=story.route.js.map