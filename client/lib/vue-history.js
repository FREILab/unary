Vue.component('history', {
	template: `
	<b-modal :id="domId" hide-footer size="lg" centered
		header-bg-variant="dark" header-text-variant="light"
		:title="'Bisherige Transaktionen (' + user.username + ')'"
	>
		Hello Modal!
	</b-modal>
	`,
	props: {
		user: {
			required: true
		},
		domId: {
			default: 'history'
		}
	},
	methods: {
		format_money: value => Number.parseFloat(value).toFixed(2),
	}
});

