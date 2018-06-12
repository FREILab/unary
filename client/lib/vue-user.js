Vue.component('user', {
	template: `
	<b-link v-on:click="$emit('select')">
		<b-card body-class="text-center">
			<b-img :src="'static/img/users/' + user.picture"
				center :blank="user.picture == 'generic.png'" :blank-color="user.color"
				rounded="circle" width="100" height="100"
				class="mb-4"
			></b-img>
			<h5>{{ user.username }}</h5>
		</b-card>
	</b-link>
	`,
	props: {
		user: {
			required: true
		},
	},
});

