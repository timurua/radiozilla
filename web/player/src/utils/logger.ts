import loglevel, { Logger, LogLevelDesc, LogLevelNames, LogLevelNumbers } from 'loglevel';

// Define custom logger interface if you want to extend the base logger
interface CustomLogger extends Logger {
  // Add any custom methods here if needed
}

// Define environment configuration interface
interface LoggerConfig {
  production: LogLevelDesc;
  development: LogLevelDesc;
  test: LogLevelDesc;
}

// Configuration for different environments
const LOG_LEVEL_CONFIG: LoggerConfig = {
  production: 'warn',
  development: 'debug',
  test: 'debug'
};

// Initialize as early as possible, before any other code runs
const logger: CustomLogger = loglevel.getLogger('app') as CustomLogger;

// Get current environment, with type safety
const currentEnv = (process.env.NODE_ENV || 'development') as keyof LoggerConfig;

// Set the logging level based on environment
logger.setLevel(LOG_LEVEL_CONFIG[currentEnv]);

// Optional: Add custom formatting or handling with type-safe method factory
const originalFactory = logger.methodFactory;
logger.methodFactory = function (
  methodName: LogLevelNames, 
  logLevel: LogLevelNumbers, 
  loggerName: string| symbol
): (...args: any[]) => void {
  const rawMethod = originalFactory(methodName, logLevel, loggerName);
  return function (message: string, ...args: any[]): void {
    rawMethod(`[${new Date().toISOString()}] ${message}`, ...args);
  };
};

// Apply the plugin
logger.setDefaultLevel(logger.getLevel());

export default logger;
