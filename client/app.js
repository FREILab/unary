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
		select_user: function (user) {
			this.currentUser = user
			// add/update a simple timeout
			if (this.userTimeout)
				clearTimeout(this.userTimeout);
			// disabled for debugging: this.userTimeout = setTimeout(() => { this.deselect_user(); }, 60000)
		},
		new_user: () => { /* TODO */ },
		deselect_user: function () { this.current_user = null; },
		buy: function (product) {
			if (!app.connected) {
				console.log("Verzögerter Einkauf verhindert.")
				return;
			}
			if (!app.currentUser) {
				console.log("Kein Nutzer ausgewählt!")
				return;
			}
			socket.emit('purchase', {uid: app.currentUser.id, pid: product.id}, ret => {
				if (ret.success) {
					this.$refs['product' + product.id][0].add_popup();
				} else {
					console.log('Damn!')
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
	let target = app.currentUser; // typically the current user receives updates
	if (!target || target.id !== user.id) {
		target = app.users.find(u => u.id === user.id);
	}
	Object.assign(target, user);
});
