#!/usr/bin/python3
import time
from flask import render_template
from init import app, db, socketio
import model as m

# retrieve all css, js files to bundle
def assets():
	return {
		# note: use vue.min, socket.io.slim in production
		'js': ['vue/vue', 'socket.io/socket.io', 'fontawesome/fontawesome-all.min', 'app'],
		'css': ['fontawesome/fa-svg-with-js']
	}

# retrieve initial full data needed by client
def payload():
	return {
		'products': [p.export() for p in m.Product.query.all()],
		'users' : [u.export() for u in m.User.query.all()]
	}

@app.route("/")
def home():
	return render_template('index.html', assets=assets(), payload=payload())

@socketio.on('my event')
def handle_my_custom_event(json):
	print('received json: ' + str(json))
	return 'one', 2    

@app.url_defaults
def add_stamp(endpoint, values):
	# add a version / datetime stamp to enforce browser reloading on new data
	values['timestamp'] = time.time()

#@app.after_request
#def add_header(r):
	# disable browser cache, remove for production!
	#r.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
	#return r

