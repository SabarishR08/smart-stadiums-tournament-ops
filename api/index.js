/**
 * Vercel serverless entry point.
 * Imports the compiled Express app and exports it as the default handler.
 * Run `npm run build` first — it writes dist/server.cjs which this file re-exports.
 *
 * NOTE: This file must stay as plain .js (CommonJS) so Vercel's Node runtime
 * can pick it up without an extra transpile step.
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const server = require('../dist/server.cjs');

// The esbuild bundle exports the Express app instance as `app` (named) or
// the module itself is the handler. Vercel expects a standard
// (req, res) => void export.
module.exports = server.app || server.default || server;
