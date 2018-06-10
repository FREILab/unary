'use strict';

var socket = io();

var app = new Vue({
	el: '#app',
	data: {
	    products: initial.products,
		users: initial.users,
		current_user: null,
		user_timeout : null,
		user_filter: '',
	},
	computed: {
		filtered_users: function() {
			return this.users.filter(u => u.username.toLowerCase().startsWith(this.user_filter.toLowerCase()));
		}
	},
	methods: {
		format_money: value => Number.parseFloat(value).toFixed(2),
		select_user: function (user) {
			this.current_user = user
			// add/update a simple timeout
			if (this.user_timeout)
				clearTimeout(this.user_timeout);
			this.user_timeout = setTimeout(() => { this.deselect_user(); }, 60000)
		},
		new_user: () => { /* TODO */ },
		deselect_user: function () { this.current_user = null; },
		buy: function (product) {
			if (!app.current_user) {
				console.log("Kein Nutzer ausgewählt!")
				return;
			}
			socket.emit('purchase', {uid: app.current_user.id, pid: product.id}, ret => {
				if (!ret.success)
					console.log("damn!");
			});
		}
	}
});

socket.on('user changed', user => {
	let target = app.current_user; // typically the current user receives updates
	if (!target || target.id !== user.id) {
		target = app.users.find(u => u.id === user.id);
	}
	Object.assign(target, user);
});
