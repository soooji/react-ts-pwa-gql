export interface Launch {
  mission_name: string;
  launch_date_local: string;
  launch_success: boolean;
}

export interface LaunchesData {
  launches: Launch[];
} 