#!/usr/bin/python3
from os import chdir
import sys
import time
from flask import render_template
import yaml
from datetime import datetime, timedelta
from init import app, db, socketio
import model as m

# retrieve all css, js files to bundle
def assets():
	return {
		# note: use vue.min, socket.io.slim in production
		'js': [
			'jquery/jquery.slim.min', 'popper/popper.min', 'bootstrap/bootstrap.min',
			'vue/vue', 'bootstrap-vue/bootstrap-vue.min', 'vue-color/vue-color.min',
			'tweenjs/Tween', 'lib/vue-animated-number', 'lib/vue-balance',
			'lib/mixins',
			'lib/vue-product', 'lib/vue-user', 'lib/vue-history', 'lib/vue-deposit', 'lib/vue-adduser',
			'socket.io/socket.io.min',
			'fontawesome/all.min',
		],
		'css': [
			'app', 'bootstrap-vue/bootstrap-vue.min',
			'fontawesome/svg-with-js'
		]
	}

# retrieve initial full data needed by client
def payload():
	products = m.Product.query.filter_by(enabled=True)
	users = m.User.query.filter_by(enabled=True)
	# Note: this may throw OSError or YAML errors
	with open('data/content/new_user.yaml') as f:
		newUser = yaml.safe_load(f)
	return {
		'products': [p.export() for p in products.all()],
		'users': [u.export() for u in users.all()],
		'newUser': newUser
	}

# build failure json response
def failure(message):
	return {'success': False, 'message': message}

# build success json response
def success(payload={}):
	return {'success': True, **payload}

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
def transactions(params):
	if 'uid' not in params:
		return failure('Nutzer ungültig!')
	today = startOfDay()
	# get today's transactions with complete data
	daily = m.Transaction.query.filter_by(user_id=params.get('uid')) \
		.filter(m.Transaction.date >= today) \
		.order_by(m.Transaction.date.desc())

	ret = {'today': [t.export(omit=('user')) for t in daily.all()]}

	if not params.get('short', False):
		# get longer backlog, but this time fuzzed out (we remove date info)
		monthly = m.Transaction.query.filter_by(user_id=params['uid']) \
			.filter(m.Transaction.date < today) \
			.filter(m.Transaction.date > today - timedelta(days=28)) \
			.order_by(m.Transaction.date.desc())
		ret['month'] = [t.export(omit=('user', 'date')) for t in monthly.all()]

	return success(ret)

@socketio.on('purchase')
def purchase(params):
	user = m.User.query.get(params.get('uid', None))
	if user is None:
		return failure('Nutzer ungültig!')
	if 'pid' in params:
		product = m.Product.query.get(params['pid'])
		if product is None:
			return failure('Produkt ungültig!')
		amount=product.prize
	else:
		if not 'amount' in params:
			return failure('Weder Produkt, noch Betrag angegeben!')
		product = None # for deposits, basically
		amount=params['amount']

	# perform purchase
	transaction = m.Transaction(user=user, product=product, amount=amount)
	user.balance -= amount
	db.session.add(transaction)
	try:
		db.session.commit()
		socketio.emit('user changed', user.export())
		return success()
	except:
		return failure('Datenbankeintrag gescheitert!')

@socketio.on('revert')
def revert(params):
	transaction = m.Transaction.query.get(params.get('tid', None))
	if transaction is None:
		return failure('Transaktion ungültig!')
	if transaction.user_id != params.get('uid', None):
		return failure('Transaktion und Nutzer passen nicht zusammen!')
	if transaction.date < startOfDay() or transaction.fulfilled:
		return failure('Transaktion kann nicht mehr revidiert werden!')
	if transaction.cancelled:
		return success() # avoid error message on double taps

	transaction.cancelled = True
	transaction.user.balance += transaction.amount
	try:
		db.session.commit()
		socketio.emit('user changed', transaction.user.export())
		return success()
	except:
		return failure('Datenbankeintrag gescheitert!')

@socketio.on('add user')
def adduser(userdata):
	# only take allowed input, and ensure it's all there
	entries = ('username', 'fullname', 'color', 'email')
	try:
		user = m.User(**{k : userdata[k] for k in entries})
	except KeyError:
		return failure('Unvollständiger Account!')

	# validate input TODO – not mission-critical here but would be nice

	# check duplicates
	if m.User.query.filter_by(username=user.username).count():
		return failure('Nutzername ist bereits belegt!')
	if m.User.query.filter_by(email=user.email).count():
		return failure('Die Email-Adresse ist bereits bekannt!')

	db.session.add(user)
	try:
		db.session.commit()
		socketio.emit('user changed', user.export())
		return success()
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

if __name__ == '__main__':
	# ensure we find our data, assets etc.
	chdir(sys.path[0])
	print("Running on http://localhost:5000")
	socketio.run(app)
