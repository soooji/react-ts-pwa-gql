import { VitePWAOptions } from "vite-plugin-pwa";

// Add type declarations for Web APIs
/// <reference lib="webworker" />
/// <reference lib="dom" />

// Add type declaration for WorkboxPlugin
interface WorkboxPlugin {
  cacheKeyWillBeUsed?: ({ request }: { request: Request }) => Promise<Request>;
  cacheWillUpdate?: ({ response }: { response: Response }) => Promise<Response | null>;
  handlerDidError?: ({ request }: { request: Request }) => Promise<Response>;
}

// Add type declaration for CacheStorage if not available
interface Cache {
  put(request: Request, response: Response): Promise<void>;
  match(request: Request): Promise<Response | undefined>;
}

interface CacheStorage {
  open(cacheName: string): Promise<Cache>;
}
declare const caches: CacheStorage;

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
          return url.href.includes('spacex-production.up.railway.app') && request.method === 'POST';
        },
        handler: "CacheFirst",
        options: {
          cacheName: "graphql-cache",
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24,
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
          matchOptions: {
            ignoreVary: true,
          },
          plugins: [
            {
              cacheKeyWillBeUsed: async ({ request }) => {
                const body = await request.clone().text();
                return new Request(`${request.url}:${body}`);
              },
              handlerDidError: async ({ request }) => {
                try {
                  const cache = await caches.open('graphql-cache');
                  const cachedResponse = await cache.match(request);
                  
                  if (cachedResponse) {
                    return cachedResponse;
                  }
                } catch (error) {
                  console.error('Cache access error:', error);
                }
                
                return new Response(
                  JSON.stringify({
                    data: null,
                    errors: [
                      {
                        message: "You are offline. No cached data available.",
                      },
                    ],
                  }),
                  {
                    status: 200,
                    headers: {
                      "Content-Type": "application/json",
                    },
                  }
                );
              },
              cacheWillUpdate: async ({ response }) => {
                try {
                  const clone = response.clone();
                  const data = await clone.json() as { errors?: unknown };
                  if (response.ok && !data.errors) {
                    return response;
                  }
                  return null;
                } catch {
                  return null;
                }
              },
            } as WorkboxPlugin,
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
            maxAgeSeconds: 60 * 60 * 24 * 7,
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
            maxAgeSeconds: 60 * 60 * 24 * 30,
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
