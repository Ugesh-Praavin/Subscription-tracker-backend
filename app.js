import express from 'express';
import { PORT } from './config/env.js';
import userRouter from './routes/user.routes.js';
import subscriptionRouter from './routes/subscription.routes.js';
import authRouter from './routes/auth.routes.js';
import connectToDatabase from './database/mongodb.js';
import dns from 'dns';
import errorMiddleware from './middleware/error.middleware.js';
import cookieParser from 'cookie-parser';
import arcjetMiddleware from './middleware/arcjet.middleware.js';
import workflowRouter from './routes/workflow.routes.js';

// Configure DNS before MongoDB connection
if (process.env.USE_CUSTOM_DNS === 'true') {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
}

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Subdub API is running',
    timestamp: new Date().toISOString(),
  });
});

app.use(arcjetMiddleware);

app.use('/api/v1/users', userRouter);
app.use('/api/v1/subscriptions', subscriptionRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/workflows', workflowRouter);

app.use(errorMiddleware);

app.get('/', (req, res) => {
  res.send('Welcome to subdub API!');
});

const startServer = async () => {
  try {
    await connectToDatabase();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Subscription Tracker is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
