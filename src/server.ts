console.clear();
import 'dotenv/config';
import 'reflect-metadata';
import App from './app';
import { createConnection } from 'typeorm';
import { userReModel as UserModel } from './models/users.model';
import AuthRoute from './routes/auth.route';
import IndexRoute from './routes/index.route';
import UsersRoute from './routes/users.route';
import validateEnv from './utils/validateEnv';
import { sendMessage } from './utils/sendMail';
import { DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME } from './config'
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
  entities: [UserModel],
})
  .then(() => console.log('connected to the Database '))
  .catch(console.error);

const app = new App([new IndexRoute(), new UsersRoute(), new AuthRoute()]);

app.listen();
