
import { Router, Request, Response } from 'express';
import authenticateToken from '../middleware/authenticateToken';
import { query } from '../services/db';
import { sendResponse } from '../utils/sendResponse';
import { Movie } from '../model/movie';
import { Like } from '../model/like';

const router = Router();

// POST /likes → add a like for the current user
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  const user = req.user;
  const movie: Movie = req.body.movie;

  if (!movie || !movie.title || !movie.release_year) {
    return sendResponse({
      res,
      statusCode: 400,
      data: null,
      message: 'Movie data is incomplete',
    });
  }

  const movieId = `${movie.title.trim().toLowerCase()}_${movie.release_year}`;

  try {
    // Ensure movie exists or insert if new
    await query(`
      INSERT INTO movies (id, title, genre, release_year, description)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (id) DO NOTHING
    `, [movieId, movie.title, movie.genre || '', movie.release_year, movie.description || '']);

    // Check if user already liked this movie
    const existing = await query<{ count: number }[]>(`
      SELECT COUNT(*)::int as count
      FROM likes
      WHERE user_id = $1 AND movie_id = $2
    `, [user.id, movieId]);

    if (existing[0].count > 0) {
      return sendResponse({
        res,
        statusCode: 409,
        data: null,
        message: 'Movie already liked',
      });
    }

    const createdAt = new Date().toISOString();

    await query(`
      INSERT INTO likes (user_id, movie_id, created_at)
      VALUES ($1, $2, $3)
    `, [user.id, movieId, createdAt]);

    return sendResponse({
      res,
      statusCode: 201,
      data: { movieId, createdAt },
      message: 'Movie liked successfully',
    });
  } catch (err: any) {
    console.error('Error liking movie:', err.message || err);
    return sendResponse({
      res,
      statusCode: 500,
      data: null,
      message: 'Server error while liking movie',
    });
  }
});

// GET /likes → fetch user’s liked movies
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  const user = req.user;
  try {
    const likes = await query<any[]>(`
      SELECT m.*
      FROM likes l
      JOIN movies m ON l.movie_id = m.id
      WHERE l.user_id = $1
      ORDER BY l.created_at DESC
    `, [user.id]);

    return sendResponse({
      res,
      statusCode: 200,
      data: likes,
      message: 'Liked movies fetched successfully',
    });
  } catch (err: any) {
    console.error('Error fetching likes:', err.message || err);
    return sendResponse({
      res,
      statusCode: 500,
      data: null,
      message: 'Server error while fetching liked movies',
    });
  }
});

export default router;
