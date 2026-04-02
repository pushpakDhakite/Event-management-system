const rateLimitStore = new Map();

const rateLimit = ({ windowMs = 15 * 60 * 1000, max = 100, message = 'Too many requests, please try again later.' }) => {
  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!rateLimitStore.has(key)) {
      rateLimitStore.set(key, []);
    }

    const requests = rateLimitStore.get(key).filter(time => time > windowStart);

    if (requests.length >= max) {
      return res.status(429).json({ error: message });
    }

    requests.push(now);
    rateLimitStore.set(key, requests);

    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - requests.length));
    res.setHeader('X-RateLimit-Reset', new Date(now + windowMs).toISOString());

    next();
  };
};

const cleanup = () => {
  const now = Date.now();
  for (const [key, requests] of rateLimitStore.entries()) {
    const valid = requests.filter(time => time > now - 15 * 60 * 1000);
    if (valid.length === 0) {
      rateLimitStore.delete(key);
    } else {
      rateLimitStore.set(key, valid);
    }
  }
};

setInterval(cleanup, 15 * 60 * 1000);

module.exports = { rateLimit };
