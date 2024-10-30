/// <reference lib="webworker" />

const CACHE_NAME = "graphql-cache-v1";

// @ts-ignore
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing");
  event.waitUntil(
    caches.open(CACHE_NAME).then(() => {
      console.log("Service Worker: Cache opened");
      // Skip waiting to activate the service worker immediately
      self.skipWaiting();
    })
  );
});

self.addEventListener("fetch", (event) => {
  // Only handle POST requests to our GraphQL endpoint
  if (event.request.method === "POST") {
    console.log(
      "Service Worker: Intercepted GraphQL request",
      event.request.url
    );
    event.respondWith(handleGraphQLRequest(event.request));
  }
});

async function handleGraphQLRequest(request) {
  try {
    const requestClone = request.clone();
    const requestBody = await requestClone.json();

    // Skip caching if it's a mutation
    if (requestBody.query.trim().startsWith('mutation')) {
      return fetch(request);
    }

    // Extract operation name using regex
    const operationName = requestBody.query.match(/query\s+(\w+)/)?.[1] || 'anonymous';
    
    // Create a more efficient cache key using operation name
    const cacheKey = JSON.stringify({
      operationName,
      variables: requestBody.variables,
    });

    console.log("Service Worker: Handling GraphQL query", {
      operationName,
      cacheKey,
    });

    // Check cache first
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(cacheKey);

    if (cachedResponse) {
      console.log("Service Worker: Returning cached response");
      return cachedResponse;
    }

    console.log("Service Worker: Cache miss, fetching from network");
    const response = await fetch(request);
    const responseClone = response.clone();

    // Store in cache
    if (response.ok) {
      const responseBody = await responseClone.json();

      if (!responseBody.errors) {
        const cacheResponse = new Response(JSON.stringify(responseBody), {
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "max-age=3600",
          },
        });

        await cache.put(cacheKey, cacheResponse);
        console.log("Service Worker: Stored response in cache");
      }
    }

    return response;
  } catch (error) {
    console.error("Service Worker Error:", error);
    return new Response(JSON.stringify({ error: "Network error" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}

self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activated");
  // Claim clients immediately
  event.waitUntil(clients.claim());

  // Clean up old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
});
