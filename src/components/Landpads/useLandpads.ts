import { graphqlClient } from "../../graphql-client";
import { useQuery } from "../../use-query";
import { LandpadsData, LandpadsVars } from "../../types/landpads";

const LANDPADS_QUERY = `
  query Landpads($limit: Int, $offset: Int) {
    landpads(limit: $limit, offset: $offset) {
      attempted_landings
      details
      id
      full_name
      wikipedia
      successful_landings
      status
      location {
        latitude
        longitude
        name
        region
      }
      landing_type
    }
  }
`;

export function useLandpadsData(variables: LandpadsVars = { limit: 5, offset: 0 }) {
  return useQuery<LandpadsData>(
    ['landpads', variables],
    async () => {
      const response = await graphqlClient.request<LandpadsData, LandpadsVars>({
        query: LANDPADS_QUERY,
        variables,
      });
      return response.data;
    }
  );
} 