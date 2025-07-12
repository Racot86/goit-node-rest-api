import express from 'express';
import { register, login, logout, getCurrent, updateAvatar, verifyEmail, resendVerificationEmail } from '../controllers/authControllers.js';
import validateBody from '../helpers/validateBody.js';
import { registerSchema, loginSchema, emailVerificationSchema } from '../schemas/userSchemas.js';
import authenticate from '../middlewares/authenticate.js';
import upload from '../middlewares/upload.js';

const authRouter = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the user
 *         email:
 *           type: string
 *           format: email
 *           description: The email of the user
 *         subscription:
 *           type: string
 *           enum: [starter, pro, business]
 *           description: The subscription level of the user
 *           default: starter
 *         avatarURL:
 *           type: string
 *           description: URL to the user's avatar image
 *         verify:
 *           type: boolean
 *           description: Whether the user's email is verified
 *           default: false
 *         verificationToken:
 *           type: string
 *           description: Token for email verification
 *       example:
 *         id: "1"
 *         email: "user@example.com"
 *         subscription: "starter"
 *         avatarURL: "https://example.com/avatar.jpg"
 *         verify: true
 */

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication and management
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       201:
 *         description: User successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                     subscription:
 *                       type: string
 *       400:
 *         description: Invalid request body
 *       409:
 *         description: Email already in use
 */
authRouter.post('/register', validateBody(registerSchema), register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User successfully logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                     subscription:
 *                       type: string
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Email or password is wrong
 */
authRouter.post('/login', validateBody(loginSchema), login);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout a user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: User successfully logged out
 *       401:
 *         description: Unauthorized
 */
authRouter.post('/logout', authenticate, logout);

/**
 * @swagger
 * /api/auth/current:
 *   get:
 *     summary: Get current user information
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email:
 *                   type: string
 *                 subscription:
 *                   type: string
 *       401:
 *         description: Unauthorized
 */
authRouter.get('/current', authenticate, getCurrent);

/**
 * @swagger
 * /api/auth/avatars:
 *   patch:
 *     summary: Update user avatar
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - avatar
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: The avatar image file
 *     responses:
 *       200:
 *         description: Avatar successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 avatarURL:
 *                   type: string
 *       400:
 *         description: Invalid file
 *       401:
 *         description: Unauthorized
 */
authRouter.patch('/avatars', authenticate, upload.single('avatar'), updateAvatar);

/**
 * @swagger
 * /api/auth/verify/{verificationToken}:
 *   get:
 *     summary: Verify user email
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: verificationToken
 *         schema:
 *           type: string
 *         required: true
 *         description: The verification token sent to the user's email
 *     responses:
 *       200:
 *         description: Email verification successful
 *       404:
 *         description: User not found or already verified
 */
authRouter.get('/verify/:verificationToken', verifyEmail);

/**
 * @swagger
 * /api/auth/verify:
 *   post:
 *     summary: Resend verification email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Verification email sent
 *       400:
 *         description: Missing required field email
 *       404:
 *         description: User not found
 */
authRouter.post('/verify', validateBody(emailVerificationSchema), resendVerificationEmail);

export default authRouter;
