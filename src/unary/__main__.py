import argparse
from pathlib import Path

from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from . import app, socketio

if __name__ == '__main__':
    parser = argparse.ArgumentParser(prog='Unary Server', description='Web application Unary digital tally sheet')
    parser.add_argument("data_path", type=Path)
    args = parser.parse_args()

    if not args.data_path.is_dir():
        raise SystemExit(f"Not a directory: {args.data_path}")
    print(f"Data directory at {args.data_path.resolve()}")
    app.config["DATA_PATH"] = args.data_path
    # when using Flask development server under Poetry, an absolute path is needed
    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{args.data_path.resolve()}/data/db.sqlite"

    global db, migrate
    db = SQLAlchemy(app)
    migrate = Migrate(app, db)

    print("Running on http://localhost:5000")
    socketio.run(app)
