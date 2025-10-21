import { Like } from './like';

interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  created_at: string;
  updated_at: string;
  likes: Like[];
}

export { User };