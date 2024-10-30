import { VitePWAOptions } from "vite-plugin-pwa";

export const pwaOptions: VitePWAOptions = {
  disable: false,
  registerType: "autoUpdate",
  manifest: {
    name: "SpaceX GraphQL Explorer",
    short_name: "SpaceX App",
    description: "SpaceX launches and landpads explorer with offline support",
    theme_color: "#ffffff",
    background_color: "#ffffff",
    display: "standalone",
    icons: [
      {
        src: "vite.svg",
        sizes: "192x192",
        type: "image/svg",
      },
    ],
  },
  workbox: {
    navigateFallback: "index.html",
    globPatterns: [
      "**/*.{js,css,html,ico,png,svg,woff2}",
    ],
    cleanupOutdatedCaches: true,
    clientsClaim: true,
    skipWaiting: true,
    runtimeCaching: [
      {
        urlPattern: ({ url, request }) => {
          return request.method === "POST" && url.pathname === "/";
        },
        handler: "NetworkFirst",
        options: {
          cacheName: "graphql-cache",
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24, // 24 hours
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
          matchOptions: {
            ignoreSearch: true,
          },
          plugins: [
            {
              cacheKeyWillBeUsed: async ({ request }) => {
                const clone = request.clone();
                const body = (await clone.json()) as {
                  query: string;
                  variables: unknown;
                };
                return new Request(
                  `graphql:${JSON.stringify({
                    query: body.query,
                    variables: body.variables,
                  })}`
                );
              },
              cacheWillUpdate: async ({ response }) => {
                try {
                  const clone = response.clone();
                  const data = (await clone.json()) as { errors?: unknown };
                  if (response.ok && !data.errors) {
                    return response;
                  }
                  return null;
                } catch {
                  return null;
                }
              },
              handlerDidError: async () => {
                return new Response(
                  JSON.stringify({
                    data: null,
                    errors: [
                      {
                        message:
                          "You are offline and no cached data is available",
                      },
                    ],
                  }),
                  {
                    status: 503,
                    headers: {
                      "Content-Type": "application/json",
                    },
                  }
                );
              },
            },
          ],
        },
      },
      {
        urlPattern: /\.(?:js|css|html)$/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "static-resources",
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
          },
        },
      },
      {
        urlPattern: /\.(?:png|gif|jpg|jpeg|svg|ico)$/i,
        handler: "CacheFirst",
        options: {
          cacheName: "images",
          expiration: {
            maxEntries: 60,
            maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
          },
        },
      },
    ],
  },
  strategies: 'generateSW',
  injectRegister: 'auto',
  devOptions: {
    enabled: true,
    type: "module",
    navigateFallback: "index.html",
  },
  minify: true,
  injectManifest: {
    injectionPoint: undefined
  },
  includeAssets: [
    'favicon.ico',
    'apple-touch-icon.png',
    'masked-icon.svg',
    'assets/**/*'
  ],
  includeManifestIcons: true
};
