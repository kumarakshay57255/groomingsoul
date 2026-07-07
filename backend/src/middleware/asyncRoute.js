/**
 * Express 4 doesn't forward rejected promises from async route handlers to the
 * error middleware automatically. Wrap any async handler with this so model
 * validation errors / DB failures become a JSON 400/500 instead of crashing
 * the Node process.
 */
function asyncRoute(fn) {
  return (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);
}

module.exports = { asyncRoute };
