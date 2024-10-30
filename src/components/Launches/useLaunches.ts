import { useQuery } from "../../use-query";
import { graphqlClient } from "../../graphql-client";
import { LaunchesData } from "./launches.types";
import { LAUNCHES_QUERY } from "./launches.constants";

export const useLaunchesData = () => {
  return useQuery<LaunchesData>(["launches"], () =>
    graphqlClient
      .request<LaunchesData>({
        query: LAUNCHES_QUERY,
      })
      .then((response) => response.data)
  );
}; 