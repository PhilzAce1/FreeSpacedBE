"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function errorMiddleware(error, __, res, _) {
    const status = error.status || 500;
    const message = error.message || 'Something went wrong';
    console.error('[ERROR] ', status, message);
    res.status(status).json({ message });
}
exports.default = errorMiddleware;
//# sourceMappingURL=error.middleware.js.map