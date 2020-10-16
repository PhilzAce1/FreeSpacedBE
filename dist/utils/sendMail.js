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
exports.sendMessage = void 0;
const mail_1 = __importDefault(require("@sendgrid/mail"));
const config_1 = require("../config");
function sendMessage(to, html) {
    return __awaiter(this, void 0, void 0, function* () {
        mail_1.default.setApiKey(config_1.SEND_GRID_API_KEY);
        const msg = {
            to,
            from: 'akuagwuphilemon11@gmail.com',
            subject: 'Sending with SendGrid is Fun',
            text: html,
            html: html,
        };
        mail_1.default
            .send(msg)
            .then(() => {
            console.log('Email sent');
        })
            .catch((error) => {
            console.error(error);
        });
    });
}
exports.sendMessage = sendMessage;
//# sourceMappingURL=sendMail.js.map