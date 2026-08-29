export type AgeRating = 'P' | 'T13' | 'T16' | 'T18';

export type MovieStatus = 'NOW_SHOWING' | 'COMING_SOON' | 'ENDED' | 'END_SHOWING';

export interface Genre {
  id: number;
  name: string;
  slug: string;
}

export interface Movie {
  id: number;
  title: string;
  originalTitle?: string;
  slug: string;
  director?: string;
  cast?: string;
  synopsis?: string;
  durationMinutes: number;
  releaseDate: string;
  endDate?: string;
  ageRating: AgeRating;
  posterUrl?: string;
  bannerUrl?: string;
  trailerUrl?: string;
  status: MovieStatus;
  genres: Genre[];
  createdAt?: string;
}
