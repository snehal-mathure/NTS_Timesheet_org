import os

class Config:
    # SQLite URI for simplicity, you can change to other databases like PostgreSQL
    SQLALCHEMY_DATABASE_URI = 'sqlite:///mydatabase1.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
