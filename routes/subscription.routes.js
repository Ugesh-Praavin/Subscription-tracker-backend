import { Router } from 'express';
import authorize from '../middleware/auth.middleware.js';
import {
  createSubscription,
  getUserSubscriptions,
} from '../controllers/subscription.controller.js';
const subscriptionRouter = Router();

subscriptionRouter.get('/', (req, res) => {
  res.send('Subscription route');
});
subscriptionRouter.get('/:id', (req, res) => {
  res.send('Subscription by id route');
});
subscriptionRouter.post('/', authorize, createSubscription);

subscriptionRouter.put('/:id', (req, res) => {
  res.send('update subscription route');
});
subscriptionRouter.delete('/:id', (req, res) => {
  res.send('delete subscription route');
});

subscriptionRouter.get('/user/:userId', authorize, getUserSubscriptions);

subscriptionRouter.put('/:id/cancel', (req, res) => {
  res.send('cancel subscription route');
});

subscriptionRouter.get('/upcoming-renewals', (req, res) => {
  res.send('Upcoming renewals route');
});

export default subscriptionRouter;
