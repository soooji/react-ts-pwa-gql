import { useQuery } from "../../use-query";
import { graphqlClient } from "../../graphql-client";
import { CompanyData } from "./company.types";
import { COMPANY_QUERY } from "./company.constants";

export const useCompanyData = () => {
  return useQuery<CompanyData>(["company"], () =>
    graphqlClient
      .request<CompanyData>({
        query: COMPANY_QUERY,
      })
      .then((response) => response.data)
  );
}; 