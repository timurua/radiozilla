from typing import Optional
from flask import Flask
from .database import db
from .containers import Container
from .api.user_api import user_bp

def create_app(config: Optional[dict] = None) -> Flask:
    app = Flask(__name__)
    
    # Configure the application
    container = Container()
    app.container = container
    
    # Load configuration
    app_config = container.config()
    app.config['SQLALCHEMY_DATABASE_URI'] = app_config.db_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    if config:
        app.config.update(config)
    
    # Initialize extensions
    db.init_app(app)
    
    # Register blueprints
    app.register_blueprint(user_bp, url_prefix='/api')
    
    # Create database tables
    with app.app_context():
        db.create_all()
    
    return app