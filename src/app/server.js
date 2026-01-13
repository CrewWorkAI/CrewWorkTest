const express = require('express');
const { permissionMiddleware } = require('./middleware/permission');

/**
 * Express application entry point.
 *
 * Only a single critical route is implemented for this prototype:
 *   GET /accounts/:id/health
 *
 * The route returns a dummy health payload and is protected by the
 * `permissionMiddleware` defined in `./middleware/permission.js`.
 */
const app = express();

app.get('/accounts/:id/health', permissionMiddleware, (req, res) => {
  // In a real system this would query a database or service.
  res.json({ account_id: req.params.id, health: 'Excellent' });
});

module.exports = app;

