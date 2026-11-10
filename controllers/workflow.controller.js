import Subscription from '../models/subscription.model.js';
import dayjs from 'dayjs';
import { createRequire } from 'module';
import { sendReminderEmail } from '../utils/send-email.js';
const require = createRequire(import.meta.url);

const { serve } = require('@upstash/workflow/express');

const REMINDERS = [7, 5, 2, 1];

export const sendReminders = serve(async (context) => {
  const { subscriptionId } = context.requestPayload;

  const subscription = await fetchSubscription(context, subscriptionId);

  if (!subscription || subscription.status !== 'active') {
    return;
  }

  // Capture the initial workflow time.
  // Upstash remembers this result during replay.
  const workflowStartTime = await context.run('get workflow start time', async () =>
    new Date().toISOString(),
  );

  const now = dayjs(workflowStartTime);
  const renewalDate = dayjs(subscription.renewalDate);

  if (renewalDate.isBefore(now)) {
    console.log('Renewal date has passed. Stopping workflow');
    return;
  }

  for (const daysBefore of REMINDERS) {
    const reminderDate = renewalDate.subtract(daysBefore, 'day');

    // Use the captured time, NOT dayjs() here.
    if (reminderDate.isAfter(now)) {
      const label = `Reminder ${daysBefore}-day`;

      console.log(`Scheduling ${label}: ${reminderDate.toISOString()}`);

      await context.sleepUntil(label, reminderDate.toDate());

      await context.run(`${daysBefore}-day-email`, async () => {
        console.log(`Sending ${daysBefore}-day reminder`);

        await sendReminderEmail({
          to: subscription.user.email,
          type: `${daysBefore} days before reminder`,
          subscription,
        });
      });
    }
  }
});

const fetchSubscription = async (context, subscriptionId) => {
  return await context.run('get subscription', async () => {
    return Subscription.findById(subscriptionId).populate('user', 'name email');
  });
};

const sleepUntilReminder = async (context, label, date) => {
  const reminderDate = date.toDate();

  console.log(`Sleeping until ${label} reminder date: ${reminderDate.toISOString()}`);

  await context.sleepUntil(label, reminderDate);
};

const triggerReminder = async (context, label, subscription) => {
  return await context.run(label, async () => {
    console.log(`Triggering ${label} reminder for subscription`);
    await sendReminderEmail({
      to: subscription.user.email,
      type: label,
      subscription,
    });
  });
};
