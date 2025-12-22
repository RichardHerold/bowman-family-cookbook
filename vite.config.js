import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOG_PATH = path.join(__dirname, '.cursor', 'debug.log');

function logDebug(data) {
  const logEntry = JSON.stringify({
    ...data,
    timestamp: Date.now(),
    sessionId: 'debug-session',
    runId: 'build-debug'
  }) + '\n';
  try {
    fs.appendFileSync(LOG_PATH, logEntry);
  } catch (e) {
    // Ignore log errors
  }
}

// #region agent log
logDebug({
  location: 'vite.config.js:config-start',
  message: 'Vite config loading',
  data: { mode: process.env.MODE || 'production' },
  hypothesisId: 'A'
});
// #endregion

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // #region agent log
  logDebug({
    location: 'vite.config.js:defineConfig',
    message: 'defineConfig called',
    data: { mode, base: mode === 'ghpages' ? '/soustack/' : '/' },
    hypothesisId: 'A'
  });
  // #endregion

  const srcMainPath = path.join(__dirname, 'src', 'main.js');
  // #region agent log
  logDebug({
    location: 'vite.config.js:file-check',
    message: 'Checking if src/main.js exists',
    data: {
      expectedPath: srcMainPath,
      exists: fs.existsSync(srcMainPath),
      srcDirExists: fs.existsSync(path.join(__dirname, 'src')),
      srcDirContents: fs.existsSync(path.join(__dirname, 'src')) ? fs.readdirSync(path.join(__dirname, 'src')) : []
    },
    hypothesisId: 'A'
  });
  // #endregion

  return {
    plugins: [
      svelte(),
      {
        name: 'debug-path-resolution',
        buildStart() {
          // #region agent log
          logDebug({
            location: 'vite.config.js:buildStart',
            message: 'Build started',
            data: { mode },
            hypothesisId: 'B'
          });
          // #endregion
        },
        resolveId(id, importer) {
          if (id === '/src/main.js' || id.includes('main.js')) {
            // #region agent log
            logDebug({
              location: 'vite.config.js:resolveId',
              message: 'Resolving main.js',
              data: {
                requestedId: id,
                importer: importer || 'index.html',
                resolved: null
              },
              hypothesisId: 'B'
            });
            // #endregion
          }
          return null;
        }
      }
    ],
    base: mode === 'ghpages' ? '/soustack/' : '/',
    build: {
      outDir: 'dist'
    }
  };
});
