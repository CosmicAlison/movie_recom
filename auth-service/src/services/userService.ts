
import { query } from './db';

export class UserService {
  static async createUser(userData: { name: string; email: string; password: string }) {
    const existingUser = await query('SELECT * FROM users WHERE email = $1', [userData.email]);

    if (Array.isArray(existingUser) && existingUser.length > 0) {
      const error = new Error('User with this email already exists') as Error & { code: string };
      error.code = 'USER_EXISTS';
      throw error;
    }

    const inserted = await query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
      [userData.name, userData.email, userData.password]
    );

    // postgres client returns array-like result; pick the first row if present
    if (Array.isArray(inserted)) return inserted[0];
    return inserted;
  }

  static async getUsers(page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const users = await query('SELECT * FROM users ORDER BY id LIMIT $1 OFFSET $2', [limit, offset]);

    const countRes = await query('SELECT COUNT(*)::int AS count FROM users');
    const total = Array.isArray(countRes) && countRes.length > 0 ? countRes[0].count : 0;

    return { users, total };
  }

  static async getUserById(id: number) {
    const res = await query('SELECT * FROM users WHERE id = $1', [id]);
    return Array.isArray(res) && res.length > 0 ? res[0] : null;
  }

  static async getUserByEmail(email: string) {
    const res = await query('SELECT * FROM users WHERE email = $1', [email]);
    return Array.isArray(res) && res.length > 0 ? res[0] : null;
  }
}
