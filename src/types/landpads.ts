export interface Location {
  latitude: number;
  longitude: number;
  name: string;
  region: string;
}

export interface Landpad {
  attempted_landings: number;
  details: string;
  id: string;
  full_name: string;
  wikipedia: string;
  successful_landings: number;
  status: string;
  location: Location;
  landing_type: string;
}

export interface LandpadsData {
  landpads: Landpad[];
}

export interface LandpadsVars {
  limit?: number;
  offset?: number;
} 