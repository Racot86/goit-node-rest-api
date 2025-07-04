import jwt from 'jsonwebtoken';
import User from '../db/models/user.js';
import HttpError from '../helpers/HttpError.js';

const { JWT_SECRET } = process.env;

const authenticate = async (req, res, next) => {
  const { authorization = '' } = req.headers;
  const [bearer, token] = authorization.split(' ');

  if (bearer !== 'Bearer' || !token) {
    return next(HttpError(401, 'Not authorized'));
  }

  try {
    const { id } = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(id);

    if (!user || !user.token || user.token !== token) {
      return next(HttpError(401, 'Not authorized'));
    }

    req.user = user;
    next();
  } catch (error) {
    next(HttpError(401, 'Not authorized'));
  }
};

export default authenticate;
