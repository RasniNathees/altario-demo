import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes';
import { errorHandler } from './middlewares';

const app = express();

// Middlewares
app.use(cors());
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable if you face CSP issues
  })
);
app.use(morgan('dev'));
app.use(express.json());

// Disable caching for API responses
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api', routes);

// Error handler (must be last)
app.use(errorHandler);

export default app;