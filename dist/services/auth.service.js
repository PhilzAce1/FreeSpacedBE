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
const jwt = __importStar(require("jsonwebtoken"));
const HttpException_1 = __importDefault(require("../exceptions/HttpException"));
const users_model_1 = require("../models/users.model");
const util_1 = require("../utils/util");
const config_1 = require("../config");
const sendMail_1 = require("../utils/sendMail");
const uuid_1 = require("uuid");
const connectDB_1 = require("../utils/connectDB");
class AuthService {
    constructor() {
        this.users = users_model_1.UserModel;
        this.redis = connectDB_1.redisDb;
    }
    signup(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (util_1.isEmptyObject(userData))
                throw new HttpException_1.default(400, "You're not userData");
            const findUser = yield this.users.findOne({
                where: { email: userData.email },
            });
            if (findUser)
                throw new HttpException_1.default(409, `You're email ${userData.email} already exists`);
            const hashedPassword = yield bcrypt.hash(userData.password, 10);
            const createUserData = Object.assign(Object.assign({}, userData), { password: hashedPassword });
            yield this.users.create(createUserData).save();
            delete createUserData.password;
            return createUserData;
        });
    }
    updateAnonUser(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (util_1.isEmptyObject(userData))
                throw new HttpException_1.default(400, "You're not userData");
            const userExist = yield this.users.findOne({ where: { id: userData.userId } });
            if ((userExist && userExist.email !== null) || !userExist) {
                return this.signup(userData);
            }
            const hashedPassword = yield bcrypt.hash(userData.password, 10);
            const updateUser = {
                username: userData.username,
                email: userData.email,
                password: hashedPassword
            };
            yield this.users.update({
                id: userData.id,
            }, updateUser);
            return updateUser;
        });
    }
    login(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (util_1.isEmptyObject(userData))
                throw new HttpException_1.default(400, "You're not userData");
            const findUser = yield this.users.findOne({
                where: { email: userData.email },
            });
            if (!findUser)
                throw new HttpException_1.default(409, `You're email ${userData.email} not found`);
            const isPasswordMatching = yield bcrypt.compare(userData.password, findUser.password);
            if (!isPasswordMatching)
                throw new HttpException_1.default(409, "You're password not matching");
            const tokenData = this.createToken(findUser);
            const cookie = this.createCookie(tokenData);
            findUser.password = '';
            return { cookie, findUser };
        });
    }
    forgotPassword(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const findUser = yield this.users.findOne({ where: { email } });
            if (!findUser) {
                throw new HttpException_1.default(404, 'email not found please check again');
            }
            const token = yield this.cacheForgotPassword(findUser.id);
            yield sendMail_1.sendMessage(findUser.email, token);
            return true;
        });
    }
    logout(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (util_1.isEmptyObject(userData))
                throw new HttpException_1.default(400, "You're not userData");
            const findUser = yield this.users.findOne({
                where: { email: userData.email },
            });
            if (!findUser)
                throw new HttpException_1.default(409, "You're not user");
            return findUser;
        });
    }
    changePassword(token, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = config_1.FORGET_PASSWORD_PREFIX + token;
            const userId = yield this.redis.get(key);
            if (!userId)
                throw new HttpException_1.default(404, "Token expired or invalid");
            const userIdNum = parseInt(userId);
            const user = yield this.users.findOne(userIdNum);
            if (!user)
                throw new HttpException_1.default(404, "User no longer exist");
            const hashedPassword = yield bcrypt.hash(newPassword, 10);
            yield this.users.update({
                id: userIdNum
            }, {
                password: hashedPassword
            });
            yield this.redis.del(key);
            const tokenData = this.createToken(user);
            const cookie = this.createCookie(tokenData);
            return { user, cookie };
        });
    }
    cacheForgotPassword(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = uuid_1.v4();
            const key = config_1.FORGET_PASSWORD_PREFIX + token;
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
    createToken(user) {
        const dataStoredInToken = { id: user.id };
        const secret = config_1.JWT_SECRET;
        const expiresIn = 60 * 60 * 24 * 3;
        return {
            expiresIn,
            token: jwt.sign(dataStoredInToken, secret, { expiresIn }),
        };
    }
    createCookie(tokenData) {
        return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn};`;
    }
}
exports.default = AuthService;
//# sourceMappingURL=auth.service.js.map