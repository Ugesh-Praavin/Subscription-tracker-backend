import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Subscription name is required'],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    price: {
      type: Number,
      required: [true, 'Subscription price is required'],
      min: [0, 'Price must be a greater than 0'],
    },
    currency: {
      type: String,
      required: [true, 'Currency is required'],
      enum: ['USD', 'EUR', 'GBP', 'INR'],
      default: 'INR', // Add more currencies as needed
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
    },
    category: {
      type: String,
      enum: ['entertainment', 'productivity', 'education', 'health', 'other'],
      required: [true, 'Category is required'],
    },
    paymentMethod: {
      type: String,
      required: [true, 'Payment method is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'expired', 'cancelled'],
      default: 'active',
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      validate: {
        validator: function (value) {
          return value <= new Date();
        },
        message: 'Start date cannot be in the future',
      },
    },
    renewalDate: {
      type: Date,

      validate: {
        validator: function (value) {
          return value >= this.startDate;
        },
        message: 'Renewal date cannot be before the start date',
      },
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // Add index for faster queries
    },
  },
  { timestamps: true },
);

// Auto calculate renewalDate based on frequency and startDate

subscriptionSchema.pre('save', function (next) {
  if (!this.renewalDate) {
    const renewalPeriods = {
      daily: 1,
      weekly: 7,
      monthly: 30,
      yearly: 365,
    };
    this.renewalDate = new Date(this.startDate);
    this.renewalDate.setDate(this.renewalDate.getDate() + renewalPeriods[this.frequency]);
  }
  // auto-update the status based on the renewalDate
  if (this.renewalDate < new Date()) {
    this.status = 'expired';
  }
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;
