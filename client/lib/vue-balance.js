Vue.component('balance', {
	template: `
	<span>€
		<strong
			:class="{'bg-danger': user.balance<0, 'text-warning': user.balance<5 && user.balance>=0}"
		>
			<animated-number :value="user.balance" :decimals=2></animated-number>
		</strong>
	</span>
	`,
	props: {
		user: {
			required: true
		},
	}
});
