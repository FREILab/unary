#!/bin/sh
# note: use only one worker for socket.io websockets to work
gunicorn -k eventlet -w1 app:app
