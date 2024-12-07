from flask_sqlalchemy import SQLAlchemy
from typing import Type, TypeVar

db = SQLAlchemy()

# Define a generic type for models
T = TypeVar('T', bound=db.Model)