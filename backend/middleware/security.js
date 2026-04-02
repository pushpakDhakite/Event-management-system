const helmet = {
  contentSecurityPolicy: (req, res, next) => {
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;");
    next();
  },
  hsts: (req, res, next) => {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  },
  noSniff: (req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    next();
  },
  frameGuard: (req, res, next) => {
    res.setHeader('X-Frame-Options', 'DENY');
    next();
  },
  xssFilter: (req, res, next) => {
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  },
  referrerPolicy: (req, res, next) => {
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  }
};

const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      return obj
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
    }
    if (Array.isArray(obj)) {
      return obj.map(item => sanitize(item));
    }
    if (obj && typeof obj === 'object') {
      const sanitized = {};
      for (const key of Object.keys(obj)) {
        sanitized[key] = sanitize(obj[key]);
      }
      return sanitized;
    }
    return obj;
  };

  if (req.body) req.body = sanitize(req.body);
  if (req.query) req.query = sanitize(req.query);
  if (req.params) req.params = sanitize(req.params);

  next();
};

const securityHeaders = [
  helmet.contentSecurityPolicy,
  helmet.hsts,
  helmet.noSniff,
  helmet.frameGuard,
  helmet.xssFilter,
  helmet.referrerPolicy
];

module.exports = { securityHeaders, sanitizeInput };
