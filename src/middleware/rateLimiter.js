import { RATE_LIMIT } from "../config/config.js";

class RateLimiter {
  constructor(options = RATE_LIMIT) {
    this.windowMs = options.windowMs;
    this.max = options.max;
    this.requests = new Map();
  }

  middleware() {
    return (req, res, next) => {
      const key = req.ip;
      const now = Date.now();
      const windowStart = now - this.windowMs;

      // Clean old entries
      if (!this.requests.has(key)) {
        this.requests.set(key, []);
      }

      const requests = this.requests.get(key);
      const validRequests = requests.filter((time) => time > windowStart);

      if (validRequests.length >= this.max) {
        return res.status(429).json({
          error: "Too many requests",
          retryAfter: Math.ceil(this.windowMs / 1000),
        });
      }

      validRequests.push(now);
      this.requests.set(key, validRequests);

      next();
    };
  }
}

export default new RateLimiter().middleware();
