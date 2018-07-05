#!/usr/bin/python3
import inspect, types
from sqlalchemy import inspect as sqlinspect
from init import db

class ExportableMixin(object):
	# list of exportable attribute names
	_exportable_ = None
	
	def _fill_exportable_(self):
		# all db columns
		columns = [c.key for c in sqlinspect(self).attrs]
		# all dynamic properties
		properties = [k[0] for k in inspect.getmembers(self.__class__, lambda o: isinstance(o, property))]
		self._exportable_ = [i for i in columns + properties if i not in self.export_blacklist]
	
	# provide a _clean_ (ie, insensitive) collection of attributes
	def export(self):
		if self._exportable_ is None:
			self._fill_exportable_()
		ret = {}
		for name in self._exportable_:
			attr = getattr(self, name)
			if (isinstance(attr, db.Model)):
				attr = attr.export()
			ret[name] = attr
		return ret

class User(ExportableMixin, db.Model):
	id = db.Column(db.Integer, primary_key=True)
	username = db.Column(db.String(80), unique=True, nullable=False)
	fullname = db.Column(db.String(80), nullable=False)
	color = db.Column(db.String(20), default='black', nullable=False)
	picture = db.Column(db.String(80), default='generic.png')
	balance = db.Column(db.Float, default='0', nullable=False)
	hasReadDisclaimer = db.Column(db.Boolean, default=False, nullable=False)

	transactions = db.relationship('Transaction', backref='user',
		order_by=lambda: Transaction.date.desc())
	
	export_blacklist = ['fullname', 'transactions']

	@property
	def lastActivity(self):
		if self.transactions and len(self.transactions) > 0:
			return self.transactions[0].date
		return None

	def __repr__(self):
		return '<User {}>'.format(self.username)

class Product(ExportableMixin, db.Model):
	id = db.Column(db.Integer, primary_key=True)
	enabled = db.Column(db.Boolean, default=False, nullable=False)
	name = db.Column(db.String(80), unique=True, nullable=False)
	picture = db.Column(db.String(80), default='generic.png')
	size = db.Column(db.String(20), nullable=False)
	prize = db.Column(db.Float, nullable=False)
	description = db.Column(db.String(500), default='', nullable=False)
	isOrganic = db.Column(db.Boolean, default=False, nullable=False)

	transactions = db.relationship('Transaction', backref='product')
	
	export_blacklist = ['transactions']

	def __repr__(self):
		return '<Product {}>'.format(self.name)

class Transaction(db.Model):
	id = db.Column(db.Integer, primary_key=True)
	user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
	product_id = db.Column(db.Integer, db.ForeignKey('product.id'))
	amount = db.Column(db.Float, nullable=False)
	date = db.Column(db.DateTime, default=db.func.now())
	
	def __repr__(self):
		if (self.product_id):
			return '<Transaction: P{} by U{} for € {}>'.format(self.product_id, self.user_id, self.amount)
		return '<Deposit by U{} for € {}>'.format(self.user_id, self.amount)

