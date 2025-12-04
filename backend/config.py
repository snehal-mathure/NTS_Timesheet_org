# # config.py

import os

class Config:
    # SQLite URI for simplicity, you can change to other databases like PostgreSQL
    SQLALCHEMY_DATABASE_URI = 'sqlite:///mydatabase1.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False

# import os

# class Config:
#     SQLALCHEMY_TRACK_MODIFICATIONS = False
#     SECRET_KEY = "your_secret_key"

#     # Point to a fixed database path
#     BASEDIR = os.path.abspath(os.path.dirname(__file__))
#     SQLALCHEMY_DATABASE_URI = f"sqlite:///{os.path.join(BASEDIR, 
#     'mydatabase.db')}"

