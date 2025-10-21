import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { sendResponse } from '../utils/sendResponse';

interface GetUserByIdParams {
  id: string;
}

export class UserController {
  static async getUsers(req: Request, res: Response): Promise<void> {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const users = await UserService.getUsers(page, limit);
    sendResponse({res, statusCode : 200, data : users, message : 'Users retrieved successfully'});
  }

  static async getUserById(req: Request<GetUserByIdParams>, res: Response): Promise<void> {
    const userId = parseInt(req.params.id, 10);
    const user = await UserService.getUserById(userId);

    if (!user) {
      return sendResponse({res, statusCode : 404, data : null, message : 'User not found'});
    }

    sendResponse({res, statusCode : 200, data : user, message : 'User retrieved successfully'});
  }
}
