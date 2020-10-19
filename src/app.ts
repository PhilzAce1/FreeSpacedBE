import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import logger from 'morgan';
import connectRedis from 'connect-redis';
import session from 'express-session';
import Routes from './interfaces/routes.interface';
import errorMiddleware from './middlewares/error.middleware';
import { PORT } from './config';
import { __prod__, COOKIE_NAME } from './config';
import { redisDb as redis } from './utils/connectDB';
const RedisStore = connectRedis(session);

class App {
	public app: express.Application;
	public port: string | number;
	public env: boolean;

	constructor(routes: Routes[]) {
		this.app = express();
		this.port = PORT || 3000;
		this.env = process.env.NODE_ENV === 'production' ? true : false;
		this.initializeMiddlewares();
		this.initializeRoutes(routes);
		this.initializeSwagger();
		this.initializeErrorHandling();
	}

	public listen() {
		this.app.listen(this.port, () => {
			console.log(`🚀 App listening on the port ${this.port}`);
		});
	}

	public getServer() {
		return this.app;
	}

	private initializeMiddlewares() {
		// const whitelist = ['http://localhost:3000', 'freespaced.co'];
		// var corsOptions = {
		// 	origin: function (origin, callback) {
		// 		if (whitelist.indexOf(origin) !== -1) {
		// 			callback(null, true);
		// 		} else {
		// 			callback(new Error('Not allowed by CORS'));
		// 		}
		// 	},
		// 	credentials: true,
		// };
		this.app.use(
			session({
				name: COOKIE_NAME,
				store: new RedisStore({
					client: redis,
					disableTouch: true,
				}),
				cookie: {
					maxAge: 1000 * 60 * 60 * 24 * 365 * 1, // 1 years
					httpOnly: true,
					sameSite: 'lax', // csrf
					secure: __prod__, // cookie only works in https
				},
				saveUninitialized: false,
				secret: 'qowiueojwojfalksdjoqiwueo',
				resave: false,
			})
		);
		if (this.env) {
			this.app.use(hpp());
			this.app.use(helmet());
			this.app.use(logger('combined'));
			// this.app.use(cors(corsOptions));
			this.app.use(cors());
		} else {
			this.app.use(helmet());
			this.app.use(logger('dev'));
			this.app.use(cors({ origin: true, credentials: true }));
		}

		this.app.use(express.json());
		this.app.use(express.urlencoded({ extended: true }));
		this.app.use(cookieParser());
	}

	private initializeRoutes(routes: Routes[]) {
		routes.forEach((route) => {
			this.app.use('/', route.router);
		});
	}
	private initializeSwagger() {
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

	private initializeErrorHandling() {
		this.app.use(errorMiddleware);
	}
}

export default App;
