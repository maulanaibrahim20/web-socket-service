class EventLogger {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000;
  }

  log(event, data) {
    const logEntry = {
      event,
      data,
      timestamp: new Date().toISOString(),
    };

    this.logs.push(logEntry);

    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console log in development
    if (process.env.NODE_ENV === "development") {
      console.log(`📝 Event: ${event}`, data);
    }

    console.log(process.env.NODE_ENV);
  }

  getLogs(limit = 100) {
    return this.logs.slice(-limit);
  }

  getLogsByEvent(event, limit = 100) {
    return this.logs.filter((log) => log.event === event).slice(-limit);
  }

  clearLogs() {
    this.logs = [];
  }
}

export default new EventLogger();
