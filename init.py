#!/usr/bin/python3
from flask import Flask, json
from flask_socketio import SocketIO
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
import sys

app = Flask(__name__)
app.config['SECRET_KEY'] = '616+819+184/+/1+/4+*14+/4+4846413m,äfaiow3'
# when using Flask development server under Poetry, an absolute path is needed
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{sys.path[0]}/data/db.sqlite'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
#app.config['SQLALCHEMY_ECHO'] = True

socketio = SocketIO(app, json=json) # use same JSON en-/decoders as flask does
db = SQLAlchemy(app)
migrate = Migrate(app, db)

