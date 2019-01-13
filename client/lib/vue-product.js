let uid = 0; // unique id for each product component

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
			:id="buttonId"
			class="buy mt-auto" block size="lg" variant="outline-success"
		>
			€ <strong>{{ format_money(product.prize) }}</strong>
		</b-button>
		<b-popover
			v-for="n in numPopup" :key="n"
			:target="buttonId" :show="true" triggers=""
			:placement="['right', 'bottom', 'left', 'top'][(n-1) % 4]" :offset="((n-1)/4)*10"
			:content="(n == 1 ? 'Gekauft!' : 'Nochmal gekauft!')">
		</b-popover>
	</b-card>
	`,
	props: {
		product: {
			required: true
		}
	},
	data: function() {
		uid++;
		return {
			buttonId: 'product_button_' + uid,
			numPopup: 0
		}
	},
	methods: {
		format_money: value => Number.parseFloat(value).toFixed(2),
		add_popup: function () {
			this.numPopup++;
			let that = this;
			window.setTimeout(() => that.numPopup = Math.max(that.numPopup - 1, 0), 3000);
		}
	}
});

