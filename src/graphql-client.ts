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

// Register service worker
async function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    try {
      // Unregister any existing service workers first
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }

      const registration = await navigator.serviceWorker.register("/service-worker.js", {
        scope: "/"
      });
      
      console.log("Service Worker registered successfully", registration);

      // Wait for the service worker to be ready
      if (registration.installing) {
        console.log("Service Worker installing");
        registration.installing.addEventListener('statechange', (e) => {
          console.log("Service Worker state changed:", (e.target as ServiceWorker).state);
        });
      }

      if (registration.waiting) {
        console.log("Service Worker waiting");
      }

      if (registration.active) {
        console.log("Service Worker active");
      }

      registration.addEventListener('activate', () => {
        console.log("Service Worker activated");
      });

    } catch (error) {
      console.error("Service Worker registration failed:", error);
    }
  } else {
    console.warn("Service Workers are not supported in this browser");
  }
}

// Register the service worker when the module loads
registerServiceWorker();

export const graphqlClient = {
  async request<TData = unknown, TVariables = Record<string, unknown>>(
    options: GraphQLRequest<TVariables>
  ): Promise<GraphQLResponse<TData>> {
    const { data } = await axiosInstance.post<GraphQLResponse<TData>>("/", {
      query: options.query,
      variables: options.variables,
    });

    if (data.errors) {
      throw new Error(data.errors.map((e) => e.message).join("\n"));
    }

    return data;
  },
};
