/**
 * Minimal Express server used solely for unit tests.
 * It wires the permission middleware and provides a very small
 * health‑check endpoint that mirrors the expectations of
 * `permission.test.js`.
 */

const express = require('express');
const { permissionMiddleware } = require('./middleware/permission');

const app = express();

// Simple route to test permission logic
app.get('/accounts/:id/health', permissionMiddleware, (req, res) => {
  const account_id = req.params.id;
  // The middleware guarantees that requester role and account-id
  // headers are present and valid before reaching this handler.
  res.json({ account_id, health: 'Excellent' });
});

module.exports = app;
