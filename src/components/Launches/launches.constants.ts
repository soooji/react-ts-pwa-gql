export const LAUNCHES_QUERY = `
  query LaunchesQuery {
    launches(limit: 10) {
      mission_name
      launch_date_local
      launch_success
    }
  }
`; 