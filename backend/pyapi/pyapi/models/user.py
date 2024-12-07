from typing import Optional
from ..database import db

class User(db.Model):
    __tablename__ = 'users'
    
    id: int = db.Column(db.Integer, primary_key=True)
    username: str = db.Column(db.String(80), unique=True, nullable=False)
    email: str = db.Column(db.String(120), unique=True, nullable=False)

    def __repr__(self) -> str:
        return f'<User {self.username}>'