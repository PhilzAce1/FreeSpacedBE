console.clear();
import 'dotenv/config';
import 'reflect-metadata';
import App from './app';

// database 
import validateEnv from './utils/validateEnv';
import { database } from './utils/connectDB'

// routes
import AuthRoute from './routes/auth.route';
import IndexRoute from './routes/index.route';
import UsersRoute from './routes/users.route';
import StoryRoute from './routes/story.route';




validateEnv();
database()

const app = new App([new IndexRoute(), new UsersRoute(), new AuthRoute(), new StoryRoute]);

app.listen();
