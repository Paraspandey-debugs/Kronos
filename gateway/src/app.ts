import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import v1Routes from './api/v1';
import { errorHandler } from './middleware/errorHandler';
import { clerkWebhook } from './controllers/webhook.controller';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());

// Webhook route must be before express.json()
app.post('/api/webhooks/clerk', express.raw({ type: 'application/json' }), clerkWebhook);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Debug middleware to log auth header
app.use((req, res, next) => {
  if (req.path.startsWith('/api/v1')) {
    console.log(`[AUTH DEBUG] ${req.method} ${req.path}`);
    console.log(`[AUTH DEBUG] Headers:`, req.headers.authorization ? 'Bearer [HIDDEN]' : 'MISSING');
  }
  next();
});

// Routes
app.use('/api/v1', v1Routes);

// Centralized Error Handling
app.use(errorHandler);

export default app;
