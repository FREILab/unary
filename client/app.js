'use strict';

var socket = io();

var app = new Vue({
	el: '#app',
	data: {
	    products: initial.products,
		users: initial.users,
		current_user: null
	},
	methods: {
		format_prize: (value) => Number.parseFloat(value).toFixed(2),
		select_user: (user) => {
			app.current_user = user
			// update anything we might need to manually update?
		},
		deselect_user: () => { app.current_user = null; },
		buy: (product) => {
			if (!app.current_user) {
				console.log("Kein Nutzer ausgewählt!")
				return;
			}
			socket.emit('purchase', {uid: app.current_user.id, pid: product.id}, (ret) => {
				if (!ret.success)
					console.log("damn!");
			});
		}
	}
});

