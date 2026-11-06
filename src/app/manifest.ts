import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Team Hub',
    short_name: 'TeamHub',
    description: 'Team resource portal, daily tools, and training hub',
    start_url: '/',
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#1E40AF',
    orientation: 'portrait-primary',
    scope: '/',
    icons: [
      {
        src: '/icon',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}

