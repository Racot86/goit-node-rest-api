import express from 'express';
import { register, login, logout, getCurrent, updateAvatar } from '../controllers/authControllers.js';
import validateBody from '../helpers/validateBody.js';
import { registerSchema, loginSchema } from '../schemas/userSchemas.js';
import authenticate from '../middlewares/authenticate.js';
import upload from '../middlewares/upload.js';

const authRouter = express.Router();

// Registration route
authRouter.post('/register', validateBody(registerSchema), register);

// Login route
authRouter.post('/login', validateBody(loginSchema), login);

// Logout route (requires authentication)
authRouter.post('/logout', authenticate, logout);

// Current user route (requires authentication)
authRouter.get('/current', authenticate, getCurrent);

// Update avatar route (requires authentication)
authRouter.patch('/avatars', authenticate, upload.single('avatar'), updateAvatar);

export default authRouter;
