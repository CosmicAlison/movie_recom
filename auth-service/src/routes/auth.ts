import { Router, Request, Response } from 'express';
import { AuthController } from '../controllers/authController';
import { sendResponse } from '../utils/sendResponse';
import authenticateToken from '../middleware/authenticateToken';
import { UserService } from '../services/userService';

const router = Router();

router.post('/signup', (req: Request, res: Response) => AuthController.signup(req, res));

router.post('/login', (req: Request, res: Response) => AuthController.login(req, res));

router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  sendResponse({ res, statusCode: 200, data: null, message: 'Logged out' });
});

router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  if (!userId) return sendResponse({ res, statusCode: 200, data: { user: null }, message: 'OK' });

  const user = await UserService.getUserById(Number(userId));
  if (!user) return sendResponse({ res, statusCode: 200, data: { user: null }, message: 'OK' });

  const { password, ...safeUser } = user as any;
  sendResponse({ res, statusCode: 200, data: { user: safeUser }, message: 'OK' });
});

export default router;