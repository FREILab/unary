'use strict';

var collator = new Intl.Collator('de', { sensitivity: 'base' });

var socket = io();

var app = new Vue({
	el: '#app',
	mixins: [moneyMixin],
	data: {
		products: initial.products.sort(collator.compare),
		users: initial.users.sort(collator.compare),
		addUserTemplate: initial.newUser,
		currentUser: null,
		userFilter: '',
		userTimeout : null,
		connected: socket.connected,
		showErrorAlert: false,
		lastServerError: ''
	},
	computed: {
		filteredUsers() {
			return this.users.filter(u => {
				if (u.id == 1) // TODO: see guestUser below
					return false;
				let filter = this.userFilter.toLowerCase();
				// allow a broad filter on real name
				let pre = u.namePrefix.toLowerCase();
				if (pre.startsWith(filter.slice(0, pre.length)))
					return true;
				return u.username.toLowerCase().startsWith(filter);
			});
		},
		guestUser() {
			// TODO: hack, maybe mark on the server or deliver separately?
			return this.users.find(u => u.id == 1);
		},
		favoriteUsers() {
			let latest = this.users.filter(u => (u !== this.guestUser && u.lastActivity));
			latest.sort((a, b) => Date.parse(b.lastActivity) - Date.parse(a.lastActivity));
			return latest.slice(0, 5);
		}
	},
	methods: {
		update_timeout() {
			// add/update a simple timeout that returns to user selection
			if (this.userTimeout)
				clearTimeout(this.userTimeout);
			this.userTimeout = setTimeout(() => this.deselect_user(), 60000)
		},
		select_user(user) {
			this.currentUser = user;
			// start deselection timeout
			this.update_timeout();
		},
		deselect_user() {
			this.currentUser = null;
			// remove user filter (considered outdated)
			this.userFilter = '';
			// ensure there are no leftover popups
			if ('products' in this.$refs)
				this.$refs['product'].forEach((p) => p.clear_popups());
		},
		fetch_transactions(parameters) {
			socket.emit('transactions', {uid: this.currentUser.id, ...parameters}, ret => {
				if (ret.success) {
					this.$refs.history.update(ret.today, ret.month);
				} else {
					this.lastServerError = ret.message;
					this.showErrorAlert = true;
				}
			});
		},
		transact(task, parameters) {
			this.update_timeout(); // honor user action
			return new Promise((resolve, reject) => {
				if (!this.connected) {
					reject("Verzögerte Transaktion verhindert.");
					return;
				}
				if (!this.currentUser) {
					reject("Kein Nutzer ausgewählt!");
					return;
				}
				socket.emit(task, {uid: this.currentUser.id, ...parameters}, ret => {
					if (ret.success) {
						resolve(ret);
					} else {
						this.lastServerError = ret.message;
						this.showErrorAlert = true;
						reject(ret.message);
					}
				});
			}).catch((msg) => console.warn('Transaktionsfehler: ' + msg));
		},
		buy(product) {
			this.transact('purchase', {pid: product.id}).then(
				() => this.$refs.product.find(c => c.product.id === product.id).add_popup()
			);
		},
		deposit(amount) {
			this.transact('purchase', {amount: -amount}).then(
				() => this.$refs.deposit.close() // TODO: provide explicit positive feedback
			);
		},
		revert(tid) {
			this.transact('revert', {tid: tid}).then(
				() => this.fetch_transactions({short: true}) // sync current state
				// note: we do not follow our philosophy of push notifications as it is a tailored list
			);
		},
		add_user(account) {
			socket.emit('add user', account, ret => {
				if (!ret.success) {
					this.lastServerError = ret.message;
					this.showErrorAlert = true;
				}
			});
		}
	}
});

socket.on('connect', () => app.connected = true);
socket.on('reconnect', () => app.connected = true);
socket.on('disconnect', reason => {
	app.connected = false;
	if (reason === 'io server disconnect') // no automatic reconnect
		socket.connect();
});

socket.on('user changed', user => {
	let needSort = true;
	let target = app.currentUser; // typically the current user receives updates
	if (!target || target.id !== user.id)
		target = app.users.find(u => u.id === user.id);

	if (target) {
		needSort = target.username != user.username;
		Object.assign(target, user);
	} else {
		app.users.push(user);
	}
	if (needSort) {
		app.users.sort(collator.compare);
	}
});
