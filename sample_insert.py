#!/usr/bin/python3
import collections
from init import db
import model as m

def insert(*objects):
	for o in objects:
		db.session.add(o)
		print('Added {}'.format(o))

products = []
products.append(m.Product(name='Libella', picture='libella.jpg', size='0.5 l', prize=0.70,
						  description='Alle Sorten', isOrganic=False, enabled=True))
products.append(m.Product(name='Löschzwerg', picture='löschzwerg.jpg', size='0.33 l', prize=1.0,
						  description='', isOrganic=False, enabled=True))
products.append(m.Product(name='Bier/Radler', picture='waldhaus.jpg', size='0.33 l', prize=1.0,
						  description='Alle Sorten <em>außer Hopfensturm/-zauber</em>',
						  isOrganic=False, enabled=True))
products.append(m.Product(name='Proviant', picture='proviant.jpg', size='0.33 l', prize=1.0,
						  description='Alle Sorten', isOrganic=True, enabled=True))
products.append(m.Product(name='Karamalz', picture='karamalz.jpg', size='0.33 l', prize=0.9,
						  description='', isOrganic=False, enabled=True))

insert(*products)

db.session.commit()
