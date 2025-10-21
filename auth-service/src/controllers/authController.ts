import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { UserService } from '../services/userService';
import { sendResponse } from '../utils/sendResponse';

interface CreateUserBody {
  name: string;
  email: string;
  password: string;
  [key: string]: any;
}

interface LoginBody {
  email: string;
  password: string;
}

interface UserExistsError extends Error {
  code: string;
  message: string;
}

export class AuthController {
  // Signup
  static async signup(req: Request<{}, {}, CreateUserBody>, res: Response) {
    try {
      const { name, email, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await UserService.createUser({ name, email, password: hashedPassword });

      // Return safe user data
      const safeUser = { id: user.id, name: user.name, email: user.email, created_at: user.created_at, updated_at: user.updated_at };

      sendResponse({ res, statusCode: 201, data: safeUser, message: 'User created successfully' });
    } catch (error) {
      const err = error as UserExistsError;
      if (err.code === 'USER_EXISTS') {
        return sendResponse({ res, statusCode: 409, data: null, message: err.message });
      }
      sendResponse({ res, statusCode: 500, data: null, message: 'Server error' });
    }
  }

  // Login
  static async login(req: Request<{}, {}, LoginBody>, res: Response) {
    try {
      const { email, password } = req.body;
      const user = await UserService.getUserByEmail(email);

      if (!user) {
        return sendResponse({ res, statusCode: 401, data: null, message: 'Invalid email or password' });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return sendResponse({ res, statusCode: 401, data: null, message: 'Invalid email or password' });
      }

  const safeUser = { id: user.id, name: user.name, email: user.email, created_at: user.created_at, updated_at: user.updated_at };

  // Generate JWT token
  const jwt = require('jsonwebtoken');
  const secret = process.env.JWT_SECRET;
  const token = secret ? jwt.sign({ id: user.id, email: user.email }, secret, { expiresIn: '1h' }) : null;

  sendResponse({ res, statusCode: 200, data: { user: safeUser, token }, message: 'Login successful' });
    } catch (error) {
      sendResponse({ res, statusCode: 500, data: null, message: 'Server error' });
    }
  }
}
