#!/usr/bin/python3
import collections
from init import db
import model as m

def insert(*objects):
	for o in objects:
		db.session.add(o)
		print('Added {}'.format(o))


a = m.Product(name='Libella Spezi', size='0.5 l', prize=0.70)
b = m.Product(name='Jung Teuersaft', size='0.33 l', prize=1.30, isOrganic=True)
c = m.Product(name='Waldhaus Dunkel', size='0.33 l', prize=1.00)
insert(a, b, c)
u = m.User.query.filter_by(username='hansi').first()

insert(m.Transaction(user=u, product=a, amount=a.prize))
insert(m.Transaction(user=u, product=b, amount=b.prize))

db.session.commit()
