"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SEND_GRID_API_KEY = exports.FORGET_PASSWORD_PREFIX = exports.__prod__ = exports.COOKIE_NAME = exports.DB_PASSWORD = exports.DB_NAME = exports.DB_USERNAME = exports.DB_PORT = exports.PORT = exports.JWT_SECRET = void 0;
exports.JWT_SECRET = process.env.JWT_SECRET;
exports.PORT = process.env.PORT;
exports.DB_PORT = process.env.DB_PORT;
exports.DB_USERNAME = process.env.DB_USERNAME;
exports.DB_NAME = process.env.DB_NAME;
exports.DB_PASSWORD = process.env.DB_PASSWORD;
exports.COOKIE_NAME = process.env.COOKIE_NAME;
exports.__prod__ = process.env.NODE_ENV === "production";
exports.FORGET_PASSWORD_PREFIX = process.env.FORGET_PASSWORD_PREFIX;
exports.SEND_GRID_API_KEY = process.env.SEND_GRID_API_KEY;
//# sourceMappingURL=config.js.map