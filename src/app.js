import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import logger from './config/logger.js';
import { buildExpressErrorHandler } from './utils/error.js';
import apiRoutes from './routes/index.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  morgan('combined', {
    stream: { write: message => logger.info(message.trim()) },
  })
);

app.get('/', (_, res) => {
  logger.info('Hello From CINEMA API');
  res.status(200).send('Hello From CINEMA API');
});

app.get('/health', (_, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get('/api/v1', (_, res) => {
  res.status(200).json({
    message: 'CINEMA API is Up and Running!',
  });
});

app.use('/api/v1', apiRoutes);

app.use((_, res) => {
  res.status(404).json({ error: 'Route Not Found' });
});

app.use(buildExpressErrorHandler(logger));

export default app;
