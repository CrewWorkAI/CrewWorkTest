/**
 * Basic permission middleware for critical routes.
 *
 * The middleware expects the following request headers to be present:
 *   * `x-user-role` – the role of the requester (e.g., "Owner" or "Collaborator")
 *   * `x-account-id` – the account ID the user belongs to.
 *
 * It protects routes that should only be visible to the **owner** of an
 * account and enforces that the `account_id` route parameter matches the
 * authenticated user's account.  All other roles, missing headers, or
 * mismatched IDs result in a `403 Forbidden` response.
 */
const permissionMiddleware = (req, res, next) => {
  const userRole = req.headers['x-user-role'];
  const userAccountId = req.headers['x-account-id'];
  const targetAccountId = req.params.id;

  if (!userRole || !userAccountId) {
    return res.status(401).json({ error: 'Unauthorized: missing headers' });
  }

  // Only an Owner on the same account may continue.
  if (userRole !== 'Owner' || userAccountId !== targetAccountId) {
    return res.status(403).json({ error: 'Forbidden: insufficient privileges' });
  }
  return next();
};

module.exports = { permissionMiddleware };

