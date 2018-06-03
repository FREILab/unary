'use strict';

var socket = io();
socket.on('connect', () => {
	socket.emit('my event', {data: 'Connected!'}, (one, two) => {
		console.log(one + ' ' + two);
	});
	
});
var app = new Vue({
	el: '#app',
	data: {
	    message: 'Hello Vue!',
	    products: initial.products,
    	users: initial.users
	},
	methods: {
		buy: (product) => {
			socket.emit('my event', {data: 'Bought' + product.id + '!'});
		}
	}
});

