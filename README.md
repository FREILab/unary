# Unary

This software implements a digital tally sheet. It is used to let users self-manage their beverage consumption at the Freilab in Freiburg.

The software is composed of two parts:

* A client written with Vue.js, delivered via HTTP as a single page
* A HTTP+Websocket server written with Python/Flask, accessing a SQLite database

## Note

Feel free to get in touch about using Unary via email: unary@lanrules.de

## Setup

A short idea of how to set this up:

* Replace the secret key in `init.py`
* Run `npm install` in `client/` directory.
* Set up the database (`flask db upgrade` using flask migrations)
* Run `python sample_insert.py` to insert sample products (or using https://sqlitebrowser.org/).
* Add product/user images in `data/img`
* Replace the font in the SCSS with a webfont you can actually deliver

## Run

The application can be run like any regular Flask/WSGI app. The included `run.sh` can be used for production.
