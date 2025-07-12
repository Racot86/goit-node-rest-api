import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import gravatar from 'gravatar';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { nanoid } from 'nanoid';
import User from '../db/models/user.js';
import HttpError from '../helpers/HttpError.js';
import sendMail from '../helpers/sendMail.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

    // Generate avatar URL using gravatar
    const avatarURL = gravatar.url(email, { s: '250', r: 'pg', d: 'identicon' });

    // Generate verification token
    const verificationToken = nanoid();

    // Create a new user
    const newUser = await User.create({
      email,
      password: hashedPassword,
      avatarURL,
      verificationToken
    });

    // Send verification email
    const verificationLink = `${req.protocol}://${req.get('host')}/api/auth/verify/${verificationToken}`;
    await sendMail({
      to: email,
      subject: 'Email verification',
      html: `<p>Please verify your email by clicking on the link: <a href="${verificationLink}">Verify Email</a></p>`
    });

    // Return the user data without password
    res.status(201).json({
      user: {
        email: newUser.email,
        subscription: newUser.subscription,
        avatarURL: newUser.avatarURL
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

    // Check if email is verified
    if (!user.verify) {
      throw HttpError(401, 'Email not verified');
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
        subscription: user.subscription,
        avatarURL: user.avatarURL
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
    const { email, subscription, avatarURL } = req.user;

    // Return user data
    res.json({
      email,
      subscription,
      avatarURL
    });
  } catch (error) {
    next(error);
  }
};

// Update avatar
export const updateAvatar = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { path: tempUpload, originalname } = req.file;

    // Create unique filename
    const filename = `${id}_${originalname}`;
    const avatarsDir = path.join(__dirname, '../public/avatars');
    const resultUpload = path.join(avatarsDir, filename);

    // Move file from temp to avatars directory
    await fs.rename(tempUpload, resultUpload);

    // Update user's avatarURL in database
    const avatarURL = `/avatars/${filename}`;
    await req.user.update({ avatarURL });

    // Return updated avatarURL
    res.json({ avatarURL });
  } catch (error) {
    next(error);
  }
};

// Verify email
export const verifyEmail = async (req, res, next) => {
  try {
    const { verificationToken } = req.params;

    // Find user by verification token
    const user = await User.findOne({ where: { verificationToken } });
    if (!user) {
      throw HttpError(404, 'User not found');
    }

    // Update user's verification status
    await user.update({ verify: true, verificationToken: null });

    // Return success message
    res.status(200).json({ message: 'Verification successful' });
  } catch (error) {
    next(error);
  }
};

// Resend verification email
export const resendVerificationEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw HttpError(404, 'User not found');
    }

    // Check if user is already verified
    if (user.verify) {
      throw HttpError(400, 'Verification has already been passed');
    }

    // Generate new verification token if needed
    if (!user.verificationToken) {
      const verificationToken = nanoid();
      await user.update({ verificationToken });
    }

    // Send verification email
    const verificationLink = `${req.protocol}://${req.get('host')}/api/auth/verify/${user.verificationToken}`;
    await sendMail({
      to: email,
      subject: 'Email verification',
      html: `<p>Please verify your email by clicking on the link: <a href="${verificationLink}">Verify Email</a></p>`
    });

    // Return success message
    res.status(200).json({ message: 'Verification email sent' });
  } catch (error) {
    next(error);
  }
};
