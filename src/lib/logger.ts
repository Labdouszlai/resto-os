type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
}

function formatTimestamp(): string {
  return new Date().toISOString();
}

function formatMessage(level: LogLevel, message: string, context?: LogContext): string {
  const base = `[${formatTimestamp()}] [${level.toUpperCase()}] ${message}`;
  if (context && Object.keys(context).length > 0) {
    return `${base} ${JSON.stringify(context)}`;
  }
  return base;
}

export const logger = {
  debug(message: string, context?: LogContext) {
    if (process.env.NODE_ENV === "development") {
      console.debug(formatMessage("debug", message, context));
    }
  },

  info(message: string, context?: LogContext) {
    console.log(formatMessage("info", message, context));
  },

  warn(message: string, context?: LogContext) {
    console.warn(formatMessage("warn", message, context));
  },

  error(message: string, context?: LogContext) {
    console.error(formatMessage("error", message, context));
  },

  child(prefix: string) {
    return {
      debug: (msg: string, ctx?: LogContext) => logger.debug(`[${prefix}] ${msg}`, ctx),
      info: (msg: string, ctx?: LogContext) => logger.info(`[${prefix}] ${msg}`, ctx),
      warn: (msg: string, ctx?: LogContext) => logger.warn(`[${prefix}] ${msg}`, ctx),
      error: (msg: string, ctx?: LogContext) => logger.error(`[${prefix}] ${msg}`, ctx),
    };
  },
};
