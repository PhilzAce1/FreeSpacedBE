console.clear();

/* -------------------------- External Dependencies ------------------------- */
import 'dotenv/config';
import 'reflect-metadata';

/* -------------------------- Internal Dependencies ------------------------- */

import App from './app';
/* -------------------------- Env Config ------------------------- */
import validateEnv from './utils/validateEnv';

/* -------------------------- Database Config & init ------------------------- */
import { database } from './utils/connectDB';

/* -------------------------- Routes ------------------------- */
import AuthRoute from './routes/auth.route';
import IndexRoute from './routes/index.route';
import UsersRoute from './routes/users.route';
import StoryRoute from './routes/story.route';
import CommentRoute from './routes/comment.route';
import BookmarkRoute from './routes/bookmark.route';
import TagRoute from './routes/tag.route';
import ReportRoute from './routes/report.route';
import TherapistRoute from './routes/therapist.route';

validateEnv();
database();

/**
 * Initialize Apps WIth Rroutes
 */
const app = new App([
	new IndexRoute(),
	new UsersRoute(),
	new AuthRoute(),
	new StoryRoute(),
	new CommentRoute(),
	new TagRoute(),
	new BookmarkRoute(),
	new ReportRoute(),
	new TherapistRoute(),
]);

/**
 * Start Server, and Listen
 */

export default app.listen();
