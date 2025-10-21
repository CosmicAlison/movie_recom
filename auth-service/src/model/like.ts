import { Movie } from "./movie";

interface Like{
    user_id: number;
    movie : Movie;
    created_at: string;
}

export {Like};