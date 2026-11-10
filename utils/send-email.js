import { emailTemplates } from './email-template.js';
import transporter, { accountEmail } from '../config/nodemailer.js';
import dayjs from 'dayjs';
export const sendReminderEmail = async ({ to, type, subscription }) => {
  if (!to || !type || !subscription) {
    throw new Error('Missing required parameters for sending reminder email');
  }

  const template = emailTemplates.find((t) => t.label === type);

  if (!template) {
    throw new Error(`Email template for type "${type}" not found`);
  }

  const mailInfo = {
    userName: subscription.user.name,
    subscriptionName: subscription.name,
    renewalDate: dayjs(subscription.renewalDate).format('MMMM D, YYYY'),
    planName: subscription.name,
    price: `${subscription.price} ${subscription.currency} per ${subscription.frequency}`,
    paymentMethod: subscription.paymentMethod,
  };

  const message = template.generateBody(mailInfo);
  const subject = template.generateSubject(mailInfo);

  const mailOptions = {
    from: accountEmail,
    to,
    subject,
    html: message,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.response);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
