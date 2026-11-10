import { Router } from 'express';
const authRouter = Router();

import { signUp, signIn, signOut } from '../controllers/auth.controller.js';

// api/v1/auth/sign-up

authRouter.post('/sign-up', signUp);

authRouter.post('/sign-in', signIn);

authRouter.post('/sign-out', signOut);

export default authRouter;
