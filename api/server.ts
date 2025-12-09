import serverless from 'serverless-http';
import app from '../server/app';

// Wrap the Express app with serverless-http and export the handler for Vercel
const handler = serverless(app as any);

export default async function (req: any, res: any) {
  return handler(req, res);
}
