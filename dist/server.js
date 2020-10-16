"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
console.clear();
require("dotenv/config");
require("reflect-metadata");
const app_1 = __importDefault(require("./app"));
const validateEnv_1 = __importDefault(require("./utils/validateEnv"));
const connectDB_1 = require("./utils/connectDB");
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const index_route_1 = __importDefault(require("./routes/index.route"));
const users_route_1 = __importDefault(require("./routes/users.route"));
const story_route_1 = __importDefault(require("./routes/story.route"));
validateEnv_1.default();
connectDB_1.database();
const app = new app_1.default([new index_route_1.default(), new users_route_1.default(), new auth_route_1.default(), new story_route_1.default]);
app.listen();
//# sourceMappingURL=server.js.map