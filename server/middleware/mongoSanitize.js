/**
 * Middleware to sanitize inputs against MongoDB / NoSQL operator injection.
 * Recursively scans request body, query, and params for keys starting with '$'
 * or containing dots ('.') which can be used to construct malicious MongoDB operator queries.
 */

function hasMongoOperator(obj) {
  if (!obj || typeof obj !== 'object') return false;

  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key.includes('.')) {
      return true;
    }
    if (typeof obj[key] === 'object' && hasMongoOperator(obj[key])) {
      return true;
    }
  }
  return false;
}

function sanitizeMongo(req, res, next) {
  if (hasMongoOperator(req.body) || hasMongoOperator(req.query) || hasMongoOperator(req.params)) {
    return res.status(400).json({
      success: false,
      message: 'Malicious operator or invalid payload detected.',
    });
  }
  next();
}

module.exports = { sanitizeMongo, hasMongoOperator };
