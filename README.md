# Unary

This software implements a digital tally sheet. It is used to let users self-manage their beverage consumption at the Freilab in Freiburg.

The software is composed of two parts:

* A client written with Vue.js, delivered via HTTP as a single page
* A HTTP+Websocket server written with Python/Flask, accessing a SQLite database

## Note

Expect an update to the software (with updated, cleaned-up dependencies) beginning of January 2020. Feel free to get in touch about using Unary via email: unary@lanrules.de

## Setup

A short idea of how to set this up:

* Replace the secret key in `init.py`
* Run `bower install` and `npm install` in `client/` directory.
* Replace the font in the SCSS with a webfont you can actually deliver
* Set up the database (`flask db …` using migrations)
* Add some content (e.g. with https://sqlitebrowser.org/, or see `sample_insert.py`)
* Add product/user gfx in `data/img`
