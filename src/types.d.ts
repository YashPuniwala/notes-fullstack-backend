import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: any; // Replace 'any' with your user type
    }
  }
}

interface CustomRequest extends Request {
  user?: any; // Replace 'any' with your user type
}