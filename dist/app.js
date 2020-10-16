"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const hpp_1 = __importDefault(require("hpp"));
const morgan_1 = __importDefault(require("morgan"));
const connect_redis_1 = __importDefault(require("connect-redis"));
const express_session_1 = __importDefault(require("express-session"));
const error_middleware_1 = __importDefault(require("./middlewares/error.middleware"));
const config_1 = require("./config");
const config_2 = require("./config");
const connectDB_1 = require("./utils/connectDB");
const RedisStore = connect_redis_1.default(express_session_1.default);
class App {
    constructor(routes) {
        this.app = express_1.default();
        this.port = config_1.PORT || 3000;
        this.env = process.env.NODE_ENV === 'production' ? true : false;
        this.initializeMiddlewares();
        this.initializeRoutes(routes);
        this.initializeSwagger();
        this.initializeErrorHandling();
    }
    listen() {
        this.app.listen(this.port, () => {
            console.log(`🚀 App listening on the port ${this.port}`);
        });
    }
    getServer() {
        return this.app;
    }
    initializeMiddlewares() {
        const whitelist = ["http://localhost:3000", "freespaced.co"];
        var corsOptions = {
            origin: function (origin, callback) {
                if (whitelist.indexOf(origin) !== -1) {
                    callback(null, true);
                }
                else {
                    callback(new Error('Not allowed by CORS'));
                }
            },
            credentials: true
        };
        this.app.use(express_session_1.default({
            name: config_2.COOKIE_NAME,
            store: new RedisStore({
                client: connectDB_1.redisDb,
                disableTouch: true,
            }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365 * 1,
                httpOnly: true,
                sameSite: "lax",
                secure: config_2.__prod__,
            },
            saveUninitialized: false,
            secret: "qowiueojwojfalksdjoqiwueo",
            resave: false,
        }));
        if (this.env) {
            this.app.use(hpp_1.default());
            this.app.use(helmet_1.default());
            this.app.use(morgan_1.default('combined'));
            this.app.use(cors_1.default(corsOptions));
        }
        else {
            this.app.use(helmet_1.default());
            this.app.use(morgan_1.default('dev'));
            this.app.use(cors_1.default({ origin: true, credentials: true }));
        }
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.urlencoded({ extended: true }));
        this.app.use(cookie_parser_1.default());
    }
    initializeRoutes(routes) {
        routes.forEach((route) => {
            this.app.use('/', route.router);
        });
    }
    initializeSwagger() {
        const swaggerJSDoc = require('swagger-jsdoc');
        const swaggerUi = require('swagger-ui-express');
        const options = {
            swaggerDefinition: {
                info: {
                    title: 'REST API',
                    version: '1.0.0',
                    description: 'Example docs',
                },
            },
            apis: ['swagger.yaml'],
        };
        const specs = swaggerJSDoc(options);
        this.app.use('/swagger', swaggerUi.serve, swaggerUi.setup(specs));
    }
    initializeErrorHandling() {
        this.app.use(error_middleware_1.default);
    }
}
exports.default = App;
//# sourceMappingURL=app.js.map