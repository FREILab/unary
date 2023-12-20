import Vue from 'vue'
import App from './App.vue'

var collator = new Intl.Collator('de', { sensitivity: 'base' });
var userCompare = (a, b) => collator.compare(a.username, b.username);
var productCompare = (a, b) => collator.compare(a.name, b.name);

var socket = io();

var app = new Vue(App)
app.$mount('#app')

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
		app.users.sort(userCompare);
	}
});
