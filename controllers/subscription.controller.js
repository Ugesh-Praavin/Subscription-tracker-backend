import Subscription from '../models/subscription.model.js';
import { workflowClient } from '../config/upstash.js';
import { SERVER_URL } from '../config/env.js';

export const createSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.create({
      ...req.body,
      user: req.user._id,
    });

    const result = await workflowClient.trigger({
      url: `${SERVER_URL}/api/v1/workflows/subscription/reminder`,
      body: {
        subscriptionId: subscription.id,
        subscriptionUserId: req.user._id,
      },
      headers: {
        'Content-Type': 'application/json',
      },
      retries: 0,
    });

    res
      .status(201)
      .json({ success: true, data: subscription, workflowRunId: result.workflowRunId });
  } catch (e) {
    next(e);
  }
};

export const getUserSubscriptions = async (req, res, next) => {
  try {
    if (req.user.userId !== req.params.id) {
      const error = new Error('You are not the owner of the account');
      error.status = 401;
      throw error;
    }
    const subscriptions = await Subscription.find({ userId: req.params.id });
    res.status(200).json({ success: true, data: subscriptions });
  } catch (error) {
    next(error);
  }
};
