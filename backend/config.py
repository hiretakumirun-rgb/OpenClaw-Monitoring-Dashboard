import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv

load_dotenv()

basedir = os.path.abspath(os.path.dirname(__file__))
db_uri = os.getenv('DATABASE_URL', 'sqlite:///instance/openclaw.db')

# Resolve relative SQLite paths to absolute paths based on the application root
if db_uri.startswith('sqlite:///') and not db_uri.startswith('sqlite:////'):
    relative_path = db_uri[len('sqlite:///'):]
    if not os.path.isabs(relative_path):
        db_uri = 'sqlite:///' + os.path.join(basedir, relative_path)

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = db_uri
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)