# Unary

This software implements a digital tally sheet. It is used to let users self-manage their beverage consumption at the Freilab in Freiburg.

The software is composed of two parts:

* A client written with Vue.js, delivered via HTTP as a single page
* A HTTP+Websocket server written with Python/Flask, accessing a SQLite database

## Note

Feel free to get in touch about using Unary via email: unary@lanrules.de

## Setup

A short idea of how to set this up:

* Run `poetry install` to setup Poetry environment
* Run `yarn install` in `client/` directory to install client-side dependencies
* Replace the secret key in `init.py`
* Set up the database (`poetry run flask --app server.py db upgrade` using flask migrations)
* Run `poetry run python sample_insert.py` to insert sample products (or using https://sqlitebrowser.org/).
* Add product/user images in `data/img`
* Replace the font in the SCSS with a webfont you can actually deliver

## Run

To run the application:

* Run `poetry run flask --app server.py run` for development
* Run `poetry run ./server.py` for production
* Or, alternatively, add your favorite WSGI server to poetry and run it

