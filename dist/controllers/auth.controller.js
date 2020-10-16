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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_service_1 = __importDefault(require("../services/auth.service"));
class AuthController {
    constructor() {
        this.authService = new auth_service_1.default();
        this.signUp = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const userData = req.body;
            try {
                let signUpUserData;
                if (userData.userId) {
                    signUpUserData = yield this.authService.updateAnonUser(userData);
                }
                else {
                    signUpUserData = yield this.authService.signup(userData);
                }
                const { password } = signUpUserData, createdUser = __rest(signUpUserData, ["password"]);
                res.status(201).json({ data: createdUser, message: 'signup' });
            }
            catch (error) {
                next(error);
            }
        });
        this.logIn = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const userData = req.body;
            try {
                const { cookie, findUser } = yield this.authService.login(userData);
                const { password } = findUser, loggedInUser = __rest(findUser, ["password"]);
                res.setHeader('Set-Cookie', [cookie]);
                res.status(200).json({ data: loggedInUser, message: 'login' });
            }
            catch (error) {
                next(error);
            }
        });
        this.forgotPassword = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const email = req.body.email;
            try {
                yield this.authService.forgotPassword(email);
                res.status(200).json({ message: 'password email sents' });
            }
            catch (error) {
                next(error);
            }
        });
        this.changePassword = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { token, newPassword } = req.body;
            try {
                const { cookie, user } = yield this.authService.changePassword(token, newPassword);
                const { password } = user, loggedInUser = __rest(user, ["password"]);
                res.setHeader('Set-Cookie', [cookie]);
                res.status(200).json({ data: loggedInUser, message: 'login' });
            }
            catch (error) {
                next(error);
            }
        });
        this.logOut = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const userData = req.user;
            try {
                const logOutUserData = yield this.authService.logout(userData);
                res.setHeader('Set-Cookie', ['Authorization=; Max-age=0']);
                res.status(200).json({ data: logOutUserData, message: 'logout' });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = AuthController;
//# sourceMappingURL=auth.controller.js.map