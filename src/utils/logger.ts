/**
 * Production-safe logging utility
 * Only logs in development, errors always log to preserve debugging
 */

type LogLevel = 'log' | 'info' | 'warn' | 'error';

const isDevelopment = import.meta.env.DEV;

interface Logger {
  log: (message: string, ...args: unknown[]) => void;
  info: (message: string, ...args: unknown[]) => void;
  warn: (message: string, ...args: unknown[]) => void;
  error: (message: string, ...args: unknown[]) => void;
}

const createLogger = (): Logger => {
  const log = (level: LogLevel, message: string, ...args: unknown[]) => {
    // Always log errors for debugging
    if (level === 'error') {
      console.error(`[Little Ladle] ${message}`, ...args);
      return;
    }
    
    // Only log other levels in development
    if (isDevelopment) {
      console[level](`[Little Ladle] ${message}`, ...args);
    }
  };

  return {
    log: (message: string, ...args: unknown[]) => log('log', message, ...args),
    info: (message: string, ...args: unknown[]) => log('info', message, ...args),
    warn: (message: string, ...args: unknown[]) => log('warn', message, ...args),
    error: (message: string, ...args: unknown[]) => log('error', message, ...args)
  };
};

export const logger = createLogger();

// Helper function to log performance metrics in development only
export const logPerformance = (operation: string, startTime: number) => {
  if (isDevelopment) {
    const duration = Date.now() - startTime;
    logger.log(`Performance: ${operation} took ${duration}ms`);
  }
};

// Helper for conditional debugging
export const debugLog = (message: string, data?: unknown) => {
  if (isDevelopment) {
    if (data !== undefined) {
      logger.log(`DEBUG: ${message}`, data);
    } else {
      logger.log(`DEBUG: ${message}`);
    }
  }
};