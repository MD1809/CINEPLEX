import { Movie } from './movie';
import { Room } from './room';

export type ShowtimeStatus = 'SCHEDULED' | 'OPENING' | 'CLOSED' | 'CANCELLED';

export interface Showtime {
  id: number;
  movie: Movie;
  room: Room;
  startTime: string;
  endTime: string;
  basePrice: number;
  status: ShowtimeStatus;
}

export interface ShowtimeMovieGroup {
  movie: Movie;
  showtimes: Showtime[];
}
