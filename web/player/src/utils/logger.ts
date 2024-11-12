import loglevel, { LoggingMethod, LogLevelDesc, LogLevelNames, LogLevelNumbers } from 'loglevel';


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
const logger = loglevel.getLogger('app');

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
): LoggingMethod {
  const rawMethod = originalFactory(methodName, logLevel, loggerName);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (...message: any[]): void => {
      rawMethod(`[${new Date().toISOString()}]`, ...message);
  };
};

// Apply the plugin
logger.setDefaultLevel(logger.getLevel());

export default logger;
