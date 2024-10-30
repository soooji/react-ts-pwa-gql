/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';

declare let self: ServiceWorkerGlobalScope;

// Take control immediately
self.skipWaiting();
clientsClaim();

// Precache all assets
precacheAndRoute(self.__WB_MANIFEST);

// Log when the service worker is active
self.addEventListener('activate', () => {
    console.log('Service worker activated');
}); 