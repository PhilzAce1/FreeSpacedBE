console.clear();
import 'dotenv/config';
import 'reflect-metadata';
import App from './app';

// database 
import { createConnection } from 'typeorm';
import { UserModel } from './models/users.model';
import { Story as StoryModel } from './models/story.model'
import { DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME } from './config'
import validateEnv from './utils/validateEnv';


// routes
import AuthRoute from './routes/auth.route';
import IndexRoute from './routes/index.route';
import UsersRoute from './routes/users.route';
import StoryRoute from './routes/story.route';

validateEnv();
createConnection({
  type: 'postgres',
  host: 'localhost',
  port: DB_PORT,
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_NAME,
  synchronize: true,
  logging: false,
  entities: [UserModel, StoryModel],
})
  .then(() => console.log('connected to the Database '))
  .catch(console.error);

const app = new App([new IndexRoute(), new UsersRoute(), new AuthRoute(), new StoryRoute]);

app.listen();
