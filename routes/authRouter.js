import express from 'express';
import { register, login, logout, getCurrent } from '../controllers/authControllers.js';
import validateBody from '../helpers/validateBody.js';
import { registerSchema, loginSchema } from '../schemas/userSchemas.js';
import authenticate from '../middlewares/authenticate.js';

const authRouter = express.Router();

// Registration route
authRouter.post('/register', validateBody(registerSchema), register);

// Login route
authRouter.post('/login', validateBody(loginSchema), login);

// Logout route (requires authentication)
authRouter.post('/logout', authenticate, logout);

// Current user route (requires authentication)
authRouter.get('/current', authenticate, getCurrent);

export default authRouter;
