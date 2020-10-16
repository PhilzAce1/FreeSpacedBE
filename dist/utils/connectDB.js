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
exports.database = exports.redisDb = void 0;
const typeorm_1 = require("typeorm");
const ioredis_1 = __importDefault(require("ioredis"));
const story_model_1 = require("../models/story.model");
const users_model_1 = require("../models/users.model");
const config_1 = require("../config");
exports.redisDb = config_1.__prod__ ? new ioredis_1.default(process.env.REDIS_URL) : new ioredis_1.default();
function connect() {
    return __awaiter(this, void 0, void 0, function* () {
        const connectionOptions = yield typeorm_1.getConnectionOptions(process.env.NODE_ENV);
        return process.env.NODE_ENV === "production"
            ? typeorm_1.createConnection(Object.assign(Object.assign({}, connectionOptions), { url: process.env.DATABASE_URL, entities: [users_model_1.UserModel, story_model_1.Story], name: "default" }))
            : typeorm_1.createConnection(Object.assign(Object.assign({}, connectionOptions), { name: "default" }));
    });
}
function database() {
    return __awaiter(this, void 0, void 0, function* () {
        let retries = 10;
        while (retries) {
            try {
                yield connect();
                console.log('Database connected');
                break;
            }
            catch (err) {
                console.log(err);
                retries -= 1;
                console.log(`retries left: ${retries}`);
                yield new Promise((res) => setTimeout(res, 5000));
            }
        }
    });
}
exports.database = database;
//# sourceMappingURL=connectDB.js.map