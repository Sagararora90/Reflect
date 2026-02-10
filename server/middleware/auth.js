import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_123');
    req.user = decoded.user; // Ensure payload structure matches Register/Login
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// Role Authorization Middleware
export const checkRole = (roles) => (req, res, next) => {
  if (!req.user) {
     return res.status(401).json({ msg: 'Unauthorized' });
  }
  if (!roles.includes(req.user.role)) {
      return res.status(403).json({ msg: 'Access Denied: You do not have the required role.' });
  }
  next();
};

export default auth;
