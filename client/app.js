'use strict';

var socket = io();

var app = new Vue({
	el: '#app',
	data: {
		products: initial.products,
		users: initial.users,
		currentUser: null,
		userFilter: '',
		userTimeout : null,
		connected: socket.connected,
		showErrorAlert: false,
		lastServerError: ''
	},
	computed: {
		filteredUsers: function () {
			return this.users.filter(u => {
				if (u.id == 1) return false; // TODO: see guestUser below
				return u.username.toLowerCase().startsWith(this.userFilter.toLowerCase());
			});
		},
		guestUser: function () {
			// TODO: hack, maybe mark on the server or deliver separately?
			return this.users.find(u => u.id == 1);
		},

		favoriteUsers: function () {
			let latest = this.users.filter(u => (u !== this.guestUser && u.lastActivity))
				.sort((a, b) => a.lastActivity < b.lastActivity)
			return latest.slice(0, 5)
		}
	},
	methods: {
		format_money: value => Number.parseFloat(value).toFixed(2),
		update_timeout: function () {
			// add/update a simple timeout that returns to user selection
			if (this.userTimeout)
				clearTimeout(this.userTimeout);
			this.userTimeout = setTimeout(() => this.deselect_user(), 60000)
		},
		select_user: function (user) {
			this.currentUser = user;
			// start deselection timeout
			this.update_timeout();
		},
		new_user: () => { /* TODO */ },
		deselect_user: function () {
			this.currentUser = null;
			// remove user filter (considered outdated)
			this.userFilter = '';
			// ensure there are no leftover popups
			if ('products' in this.$refs)
				this.$refs['product'].forEach((p) => p.clear_popups());
		},
		fetch_transactions: function () {
			socket.emit('transactions', {uid: this.currentUser.id}, ret => {
				if (ret.success) {
					this.$refs.history.update(ret.today, ret.month);
				} else {
					this.lastServerError = ret.message;
					this.showErrorAlert = true;
				}
			});
		},
		transact: function (task, parameters) {
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
		buy: function (product) {
			this.transact('purchase', {pid: product.id}).then(
				() => this.$refs.product.find(c => c.product.id === product.id).add_popup()
			);
		},
		deposit: function (amount) {
			this.transact('purchase', {amount: -amount}).then(
				() => this.$refs.deposit.close() // TODO: provide explicit positive feedback
			);
		},
		revert: function (tid) {
			this.transact('revert', {tid: tid}).then(
				() => this.fetch_transactions() // sync current state regarding transactions
				// note: we do not follow our philosophy of push notifications as it is a tailored list
			);
		},
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
	let target = app.currentUser; // typically the current user receives updates
	if (!target || target.id !== user.id) {
		target = app.users.find(u => u.id === user.id);
	}
	Object.assign(target, user);
});
