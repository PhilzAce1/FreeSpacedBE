"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const bcrypt = __importStar(require("bcrypt"));
const HttpException_1 = __importDefault(require("../exceptions/HttpException"));
const users_model_1 = require("../models/users.model");
const util_1 = require("../utils/util");
const config_1 = require("../config");
const connectDB_1 = require("../utils/connectDB");
const uuid_1 = require("uuid");
const sendMail_1 = require("../utils/sendMail");
class UserService {
    constructor() {
        this.users = users_model_1.UserModel;
        this.redis = connectDB_1.redisDb;
    }
    findAllUser() {
        return __awaiter(this, void 0, void 0, function* () {
            const users = yield this.users.find();
            return users;
        });
    }
    findUserById(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const findUser = yield this.users.findOne({ where: { id: userId } });
            if (!findUser)
                throw new HttpException_1.default(409, "You're not user");
            return findUser;
        });
    }
    createUser(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (util_1.isEmptyObject(userData))
                throw new HttpException_1.default(400, "You're not userData");
            const findUser = yield this.users.findOne({ where: { email: userData.email } });
            if (findUser)
                throw new HttpException_1.default(409, `You're email ${userData.email} already exists`);
            const hashedPassword = yield bcrypt.hash(userData.password, 10);
            const createUserData = Object.assign(Object.assign({ id: this.users.length + 1 }, userData), { password: hashedPassword });
            return createUserData;
        });
    }
    createAnonUser() {
        return __awaiter(this, void 0, void 0, function* () {
            const newUser = yield this.users.create();
            return newUser.id;
        });
    }
    ;
    updateUser(userId, userData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (util_1.isEmptyObject(userData))
                throw new HttpException_1.default(400, "You're not userData");
            const findUser = this.users.findOne({ where: { email: userData.email } });
            if (!findUser)
                throw new HttpException_1.default(409, "You're not user");
            return findUser;
        });
    }
    changePassword({ id, newPassword }) {
        return __awaiter(this, void 0, void 0, function* () {
            const findUser = yield this.users.findOne({ where: { id } });
            if (!findUser) {
                throw new HttpException_1.default(404, `user is either not loggedin or does not exist`);
            }
            const hashedPassword = yield bcrypt.hash(newPassword, 10);
            yield this.users.update(id, { password: hashedPassword });
            return true;
        });
    }
    deleteUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const findUser = yield this.users.find({ where: { id: userId } });
            if (!findUser)
                throw new HttpException_1.default(409, "You're not user");
            const deleteUserData = yield this.users.delete(userId);
            return findUser;
        });
    }
    sendVerifyUserEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const findUser = yield this.users.findOne({ where: { email } });
            if (!findUser)
                throw new HttpException_1.default(404, 'user not found');
            const token = yield this.cacheVerifiedPwd(findUser.id);
            yield sendMail_1.sendMessage(findUser.email, token);
            return true;
        });
    }
    verifyUser(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = yield this.redis.get(token);
            if (!userId)
                throw new HttpException_1.default(404, "user no longer exist or token expired");
            const userIdNum = parseInt(userId);
            const user = yield this.users.findOne(userIdNum);
            if (!user)
                throw new HttpException_1.default(404, "user no longer exist or token expired");
            yield this.users.update({
                id: userIdNum
            }, {
                verified: true
            });
            return true;
        });
    }
    cacheVerifiedPwd(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = uuid_1.v4();
            const key = token;
            const time = 1000 * 60 * 60 * 24 * 1;
            if (config_1.__prod__) {
                yield this.redis.set(key, id, "ex", time);
            }
            else {
                yield this.redis.set(key, id);
            }
            return token;
        });
    }
}
exports.default = UserService;
//# sourceMappingURL=users.service.js.map