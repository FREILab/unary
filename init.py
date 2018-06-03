#!/usr/bin/python3
from flask import Flask
from flask_socketio import SocketIO
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

app = Flask(__name__)
app.config['SECRET_KEY'] = '616+819+184/+/1+/4+*14+/4+4846413m,äfaiow3'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///data/db.sqlite'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ECHO'] = True

socketio = SocketIO(app)
db = SQLAlchemy(app)
migrate = Migrate(app, db)

