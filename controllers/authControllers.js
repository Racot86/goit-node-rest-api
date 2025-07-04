import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../db/models/user.js';
import HttpError from '../helpers/HttpError.js';

const { JWT_SECRET } = process.env;

// Register a new user
export const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if user with this email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw HttpError(409, 'Email in use');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = await User.create({
      email,
      password: hashedPassword
    });

    // Return the user data without password
    res.status(201).json({
      user: {
        email: newUser.email,
        subscription: newUser.subscription
      }
    });
  } catch (error) {
    next(error);
  }
};

// Login user
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw HttpError(401, 'Email or password is wrong');
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw HttpError(401, 'Email or password is wrong');
    }

    // Generate JWT token
    const payload = { id: user.id };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '23h' });

    // Update user's token in database
    await user.update({ token });

    // Return token and user data
    res.json({
      token,
      user: {
        email: user.email,
        subscription: user.subscription
      }
    });
  } catch (error) {
    next(error);
  }
};

// Logout user
export const logout = async (req, res, next) => {
  try {
    // Clear user's token
    await req.user.update({ token: null });

    // Return no content
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// Get current user
export const getCurrent = async (req, res, next) => {
  try {
    const { email, subscription } = req.user;

    // Return user data
    res.json({
      email,
      subscription
    });
  } catch (error) {
    next(error);
  }
};
