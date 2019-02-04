let uid = 0; // unique id for each product component

Vue.component('product-card', {
	mixins: [moneyMixin],
	template: `
	<b-card
		:img-src="'static/img/products/' + product.picture"
		overlay
		body-class="d-flex flex-column"
		class="product"
	>
		<h5 class="card-text"><b>{{ product.name }}</b></h5>
		<p class="card-text">
			<strong>{{ product.size }}</strong>
			<span v-if="product.isOrganic">
				<i class="text-success fas fa-leaf"></i>
			</span>
			<span v-if="product.description">
				/ <span v-html="product.description"></span>
			</span>
		</p>
		<b-button @click="$emit('order')"
			:id="buttonId"
			class="buy mt-auto" block size="lg" variant="outline-success"
		>
			€ <strong>{{ format_money(product.prize) }}</strong>
		</b-button>
		<b-popover
			v-for="n in numPopup" :key="n"
			:target="buttonId" container="#app" show triggers=""
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
		clear_popups: function () { this.numPopup = 0; },
		add_popup: function () {
			this.numPopup++;
			let that = this;
			window.setTimeout(() => that.numPopup = Math.max(that.numPopup - 1, 0), 3000);
		}
	}
});

