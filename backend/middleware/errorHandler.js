const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Unauthorized access' });
  }

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: 'Resource already exists' });
  }

  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
};

const notFound = (req, res) => {
  res.status(404).json({ error: 'Route not found' });
};

module.exports = { errorHandler, notFound };