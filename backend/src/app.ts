import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import env from './config/env';
import { errorHandler } from './middlewares/error.middleware';
import { notFoundHandler } from './middlewares/notFound.middleware';
import routes from './routes';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.cors.origins,
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

if (env.nodeEnv !== 'test') {
  app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
}

app.use('/api', routes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
