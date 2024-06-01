const jwt = require('jsonwebtoken');

const isAuthenticated = (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

  if (!token) {
    return res.status(401).send({ error: 'No token provided' });
  }

  jwt.verify(token, process.env.SECRET_TOKEN, (err, decoded) => {
    if (err) {
      return res.status(401).send({ error: 'Failed to authenticate token' });
    }

    req.user = decoded;
    next();
  });
};

module.exports = {
  isAuthenticated,
};