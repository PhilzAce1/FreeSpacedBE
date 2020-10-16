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
const HttpException_1 = __importDefault(require("../exceptions/HttpException"));
const users_service_1 = __importDefault(require("../services/users.service"));
class UsersController {
    constructor() {
        this.userService = new users_service_1.default();
        this.getUsers = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const findAllUsersData = yield this.userService.findAllUser();
                res.status(200).json({ data: findAllUsersData, message: 'findAll' });
            }
            catch (error) {
                next(error);
            }
        });
        this.getUserById = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const userId = Number(req.params.id);
            try {
                const findOneUserData = yield this.userService.findUserById(userId);
                res.status(200).json({ data: findOneUserData, message: 'findOne' });
            }
            catch (error) {
                next(error);
            }
        });
        this.createUser = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const userData = req.body;
            try {
                const createUserData = yield this.userService.createUser(userData);
                res.status(201).json({ data: createUserData, message: 'created' });
            }
            catch (error) {
                next(error);
            }
        });
        this.changePassword = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { id, newPassword } = req.body;
            try {
                const success = yield this.userService.changePassword({
                    id,
                    newPassword,
                });
                if (!success)
                    throw new HttpException_1.default(404, 'something went wrong');
                res.status(200).json({ success: true, message: 'password changed' });
            }
            catch (error) {
                next(error);
            }
        });
        this.updateUser = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const userId = Number(req.params.id);
            const userData = req.body;
            try {
                const updateUserData = yield this.userService.updateUser(userId, userData);
                res.status(200).json({ data: updateUserData, message: 'updated' });
            }
            catch (error) {
                next(error);
            }
        });
        this.deleteUser = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const userId = Number(req.params.id);
            try {
                const deleteUserData = yield this.userService.deleteUser(userId);
                res.status(200).json({ data: deleteUserData, message: 'deleted' });
            }
            catch (error) {
                next(error);
            }
        });
        this.sendVerifyEmail = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                yield this.userService.sendVerifyUserEmail(email);
                res.status(200).json({ message: 'email sent' });
            }
            catch (error) {
                next(error);
            }
        });
        this.verifyUser = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { token } = req.body;
                yield this.userService.verifyUser(token);
                res.status(200).json({ message: 'email sent' });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = UsersController;
//# sourceMappingURL=users.controller.js.map