import { Router } from 'express';
const userRouter = Router();
import { getAllUsers, getUser } from '../controllers/user.controller.js';
import authorize from '../middleware/auth.middleware.js';

userRouter.get('/', getAllUsers);
userRouter.get('/:id', authorize, getUser);

userRouter.post('/', (req, res) => {
  res.send('create user route');
});

userRouter.put('/:id', (req, res) => {
  res.send('update user route');
});

userRouter.delete('/:id', (req, res) => {
  res.send('delete user route');
});

export default userRouter;
