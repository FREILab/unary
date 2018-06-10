#!/usr/bin/python3
import time
from flask import render_template
from sqlalchemy import exc
from init import app, db, socketio
import model as m

# retrieve all css, js files to bundle
def assets():
	return {
		# note: use vue.min, socket.io.slim in production
		'js': [
			'jquery/jquery.slim.min', 'popper/popper.min', 'bootstrap/bootstrap.min',
			'vue/vue', 'bootstrap-vue/bootstrap-vue.min',
			'tweenjs/Tween', 'lib/vue-animated-number',
			'socket.io/socket.io',
			'fontawesome/fontawesome-all.min',
		],
		'css': [
			'app', 'bootstrap-vue/bootstrap-vue.min',
			'fontawesome/fa-svg-with-js'
		]
	}

# retrieve initial full data needed by client
def payload():
	return {
		'products': [p.export() for p in m.Product.query.order_by('name').all()],
		'users' : [u.export() for u in m.User.query.order_by('username').all()]
	}

@app.route("/")
def home():
	return render_template('index.html', assets=assets(), payload=payload())

@socketio.on('purchase')
def purchase(json):
	print(dict(json))
	user = m.User.query.get(json['uid'])
	if user is None:
		return {'success': False, 'message': 'Nutzer ungültig!'}
	if 'pid' in json:
		product = m.Product.query.get(json['pid'])
		if product is None:
			return {'success': False, 'message': 'Produkt ungültig!'}
	else:
		product = None # for deposits, basically
	
	# perform purchase
	transaction = m.Transaction(user=user, product=product, amount=product.prize)
	user.balance -= product.prize
	db.session.add(transaction)
	try:
		db.session.commit()
	except:
		return {'success': False, 'message': 'Datenbankeintrag gescheitert!'}
	socketio.emit('user changed', user.export())
	return {'success': True}
		

@app.url_defaults
def add_stamp(endpoint, values):
	# add a version / datetime stamp to enforce browser reloading on new data
	values['timestamp'] = time.time()

#@app.after_request
#def add_header(r):
	# disable browser cache, remove for production!
	#r.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
	#return r

