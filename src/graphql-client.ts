import axiosInstance from "./axios";

interface GraphQLRequest<V = Record<string, unknown>> {
  query: string;
  variables?: V;
}

interface GraphQLResponse<T> {
  data: T;
  errors?: Array<{
    message: string;
    locations?: Array<{
      line: number;
      column: number;
    }>;
    path?: string[];
  }>;
}

export const graphqlClient = {
  async request<TData = unknown, TVariables = Record<string, unknown>>(
    options: GraphQLRequest<TVariables>
  ): Promise<GraphQLResponse<TData>> {
    try {
      const { data } = await axiosInstance.post<GraphQLResponse<TData>>("/", {
        query: options.query,
        variables: options.variables,
      });

      if (data.errors) {
        throw new Error(data.errors.map((e) => e.message).join("\n"));
      }

      return data;
    } catch (error) {
      // If it's an offline error, let the service worker handle it
      if (!navigator.onLine || error instanceof TypeError) {
        throw new Error('Network error - Service Worker will handle offline data');
      }
      throw error;
    }
  },
};
