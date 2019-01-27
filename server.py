#!/usr/bin/python3
import time
from flask import render_template
from sqlalchemy import exc
from datetime import datetime, timedelta
from init import app, db, socketio
import model as m

# retrieve all css, js files to bundle
def assets():
	return {
		# note: use vue.min, socket.io.slim in production
		'js': [
			'jquery/jquery.slim.min', 'popper/popper.min', 'bootstrap/bootstrap.min',
			'vue/vue', 'bootstrap-vue/bootstrap-vue.min',
			'tweenjs/Tween', 'lib/vue-animated-number', 'lib/vue-balance',
			'lib/vue-product', 'lib/vue-user', 'lib/vue-history', 'lib/vue-deposit',
			'socket.io/socket.io',
			'fontawesome/all.min',
		],
		'css': [
			'app', 'bootstrap-vue/bootstrap-vue.min',
			'fontawesome/svg-with-js'
		]
	}

# retrieve initial full data needed by client
def payload():
	products = m.Product.query.filter_by(enabled=True).order_by('name')
	users = m.User.query.filter_by(enabled=True).order_by('username')
	return {
		'products': [p.export() for p in products.all()],
		'users' : [u.export() for u in users.all()]
	}

# build failure json response (convenience)
def failure(message):
	return {'success': False, 'message': message}

# determine when this day started from our point of view
def startOfDay():
	if datetime.now().hour > 5: # let's say a day starts and ends at 5am
		return datetime.today().replace(hour=5)
	else:
		return (datetime.today() - timedelta(days=1)).replace(hour=5)

@app.route("/")
def home():
	return render_template('index.html', assets=assets(), payload=payload())

@socketio.on('transactions')
def transactions(json):
	today = startOfDay()
	# get today's transactions with complete data
	daily = m.Transaction.query.filter_by(user_id=json['uid']) \
		.filter(m.Transaction.date >= today) \
		.order_by(m.Transaction.date.desc())
	# get longer backlog, but this time fuzzed out (we remove date info)
	monthly = m.Transaction.query.filter_by(user_id=json['uid']) \
		.filter(m.Transaction.date < today) \
		.filter(m.Transaction.date > today - timedelta(days=28)) \
		.order_by(m.Transaction.date.desc())

	return {
		'success': True,
		'today': [t.export(omit=('user')) for t in daily.all()],
		'month': [t.export(omit=('user', 'date')) for t in monthly.all()]
	}

@socketio.on('purchase')
def purchase(json):
	user = m.User.query.get(json['uid'])
	if user is None:
		return failure('Nutzer ungültig!')
	if 'pid' in json:
		product = m.Product.query.get(json['pid'])
		if product is None:
			return failure('Produkt ungültig!')
		amount=product.prize
	else:
		if not json['amount']:
			return failure('Weder Produkt, noch Betrag angegeben!')
		product = None # for deposits, basically
		amount=json['amount']

	# perform purchase
	transaction = m.Transaction(user=user, product=product, amount=amount)
	user.balance -= amount
	db.session.add(transaction)
	try:
		db.session.commit()
		socketio.emit('user changed', user.export())
		return {'success': True}
	except:
		return failure('Datenbankeintrag gescheitert!')

@socketio.on('revert')
def revert(json):
	transaction = m.Transaction.query.get(json['tid'])
	if transaction is None:
		return failure('Transaktion ungültig!')
	if transaction.user_id != json['uid']:
		return failure('Transaktion und Nutzer passen nicht zusammen!')
	if transaction.date < startOfDay() or transaction.fulfilled:
		return failure('Transaktion kann nicht mehr revidiert werden!')
	if transaction.cancelled:
		return failure('Transaktion wurde bereits revidiert!')

	transaction.cancelled = True
	transaction.user.balance += transaction.amount
	try:
		db.session.commit()
		socketio.emit('user changed', transaction.user.export())
		return {'success': True}
	except:
		return failure('Datenbankeintrag gescheitert!')

@app.url_defaults
def add_stamp(endpoint, values):
	# add a version / datetime stamp to enforce browser reloading on new data
	values['timestamp'] = time.time()

#@app.after_request
#def add_header(r):
	# disable browser cache, remove for production!
	#r.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
	#return r

