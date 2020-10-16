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
const story_service_1 = __importDefault(require("../services/story.service"));
const users_service_1 = __importDefault(require("../services/users.service"));
class StoryController {
    constructor() {
        this.storyService = new story_service_1.default();
        this.userService = new users_service_1.default();
        this.getAllStories = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield this.storyService.getAllStories();
                res.status(200).json({
                    success: true,
                    data
                });
            }
            catch (error) {
                next(error);
            }
        });
        this.createPost = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const storyData = req.body;
            if (!storyData.creatorId) {
                storyData.creatorId = yield this.userService.createAnonUser();
            }
            try {
                const createdStory = yield this.storyService.createStory(storyData);
                res.status(200).json({
                    data: createdStory,
                    message: "storyCreated"
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = StoryController;
//# sourceMappingURL=story.controller.js.map