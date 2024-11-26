import os

# Base configuration
class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'default-secret-key')  # Fallback if no environment variable
    DEBUG = False
    TESTING = False

    # Database settings
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///app.db')  # Example with SQLite fallback
    SQLALCHEMY_TRACK_MODIFICATIONS = False  # To suppress SQLAlchemy warning

    # React build path (for serving static files)
    REACT_BUILD_DIR = os.path.join(os.getcwd(), 'frontend', 'build')

    # Other configurations
    API_PREFIX = '/api'  # Prefix for API routes


# Development configuration
class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.getenv('DEV_DATABASE_URL', 'sqlite:///dev.db')


# Testing configuration
class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = os.getenv('TEST_DATABASE_URL', 'sqlite:///test.db')
    WTF_CSRF_ENABLED = False  # Disable CSRF for testing


# Production configuration
class ProductionConfig(Config):
    SECRET_KEY = os.getenv('SECRET_KEY')  # Ensure SECRET_KEY is set in production
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')  # Production database URL


# Mapping environments to configurations
config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig,
}
