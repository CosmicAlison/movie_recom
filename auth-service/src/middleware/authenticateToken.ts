import { sendResponse } from '../utils/sendResponse';

import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const authenticateToken = (req : Request, res : Response, next : NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return sendResponse({
      res,
      statusCode: 401,
      data: null,
      message: 'Access token required',
    });
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err, user) => {
    if (err) {
      return sendResponse({
        res,
        statusCode: 403,
        data: null,
        message: 'Invalid token',
      });
    }

    req.user = user;
    next();
  });
};

export default authenticateToken;