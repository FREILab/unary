Vue.component('product', {
	template: `
	<b-card
		:header="product.name" header-tag="h5"
		:img-src="'static/img/products/' + product.picture"
		img-top img-fluid
		body-class="d-flex flex-column"
	>
		<div>
			<strong>{{ product.size }}</strong>
			<span v-if="product.isOrganic">
				<i class="text-success fas fa-leaf"></i>
			</span>
			<span v-if="product.description">
				/ <span v-html="product.description"></span>
			</span>
		</div>
		<b-button v-on:click="$emit('order')"
			class="buy mt-auto" block size="lg" variant="outline-success"
		>
			€ <strong>{{ format_money(product.prize) }}</strong>
		</b-button>
	</b-card>
	`,
	props: {
		product: {
			required: true
		},
	},
	methods: {
		format_money: value => Number.parseFloat(value).toFixed(2)
	}
});

