import { defineConfig } from 'vite';

// './' zorgt dat de gebouwde site werkt vanuit een submap op GitHub Pages
// (bijv. camiel20.github.io/ruimte-spellen/). Zonder dit zou hij de
// bestanden op de verkeerde plek zoeken.

export default defineConfig({
  base: './',
  build: {
    chunkSizeWarningLimit: 1600, // Phaser is groot, dit onderdrukt de waarschuwing
  },
});
