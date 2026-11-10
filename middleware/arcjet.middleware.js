import aj from '../config/arcjet.js';

const arcjetMiddleware = async (req, res, next) => {
  try {
    const decision = await aj.protect(req, { requested: 1 });
    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return res.status(429).json({
          success: false,
          message: 'Too many requests. Please try again later. Rate limit exceeded.',
        });
      }
      if (decision.reason.isBot()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Bot activity detected.',
        });
      }
      return res.status(403).json({
        success: false,
        message: 'Access denied. Suspicious activity detected.',
      });
    }
    next();
  } catch (error) {
    console.log(`Arcjet Middleware Error: ${error.message}`);
    next(error);
  }
};

export default arcjetMiddleware;
