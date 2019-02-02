Vue.component('user-card', {
	template: `
	<b-card @click="$emit('select')"
		body-class="text-center"
		class="user"
	>
		<b-img :src="'static/img/users/' + user.picture"
			center :blank="user.picture == 'generic.png'" :blank-color="user.color"
			rounded="circle" width="100" height="100"
			class="mb-4"
		></b-img>
		<h5>{{ user.username }}</h5>
	</b-card>
	`,
	props: {
		user: {
			required: true
		},
	},
});

