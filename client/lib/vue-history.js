Vue.component('history-modal', {
	mixins: [moneyMixin, modalMixin],
	template: `
	<b-modal :id="domId"
		hide-footer size="lg"
		header-bg-variant="dark" header-text-variant="light"
		@show="onShow(); reset()"
	>
		<template slot="modal-title" v-if="user && visible">
			Letzte Transaktionen
			(<strong>{{user.username}}</strong>, Guthaben
				<balance-text :user="user"></balance-text>)
		</template>
		<template v-if="transToday.length">
			<p>Falls du einen Fehler gemacht hast, kannst du Transaktionen von heute hier revidieren.</p>
			<h4>Heute:</h4>
			<b-table :fields="fieldsToday" :items="transToday"
				striped	:tbody-tr-class="style_row"
			>
				<template slot="product" slot-scope="_">
					<b-img v-if="_.item.product"
						height="20" rounded
						:src="'static/img/products/' + _.item.product.picture">
					</b-img>
					{{ _.value }}
					<small v-if="_.item.fulfilled">
						<i class="text-success fas fa-check"></i>
					</small>
				</template>
				<template slot="cancel" slot-scope="_">
					<b-button v-if="!(_.item.cancelled || _.item.fulfilled)"
						@click="$emit('revert', _.item.id)"
						variant="warning" size="sm"
					>
						<i class="fas fa-backspace"></i> Zurücknehmen
					</b-button>
				</template>
			</b-table>
		</template>
		<p v-else>Heute noch nichts getrunken? 😾</p>
		<template v-if="transMonth.length">
			<hr>
			<h4>In den letzten 28 Tagen:</h4>
			<b-table :fields="fieldsMonth" :items="transMonth"
				striped small :tbody-tr-class="style_row">
			</b-table>
		</template>
		<hr>
		<p class="text-muted">
			Aus Datenschutzgründen werden länger zurückliegende Transaktionen nicht angezeigt.
		</p>
	</b-modal>
	`,
	props: {
		user: {
			required: true
		}
	},
	data: function () {
		let f = {
			product: { label: 'Produkt', tdClass: this.style_product, formatter: this.format_product },
			date: { label: 'Uhrzeit', formatter: this.format_date },
			amount: { label: 'Betrag', class: 'text-right', tdClass: this.style_money, formatter: this.format_money },
			cancel: { label: '', tdClass: 'button text-right'},
		}
		return {
			fieldsToday: {
				product: f.product, date: f.date, amount: f.amount, cancel: f.cancel
			},
			fieldsMonth: {
				product: f.product, amount: f.amount
			},
			transToday: [],
			transMonth: []
		};
	},
	methods: {
		format_product: p => (p ? p.name : 'Einzahlung'),
		style_product: p => (p ? '' : 'font-italic'),
		style_money: value => 'text-light font-weight-bold ' + (value > 0 ? 'bg-danger' : 'bg-success'),
		format_date: date => new Intl.DateTimeFormat(
			'de-DE', {hour: 'numeric', minute: 'numeric'}).format(Date.parse(date)),
		style_row: item => (item.cancelled ? 'cancelled' : ''),
		reset: function () {
			this.transToday = [];
			this.transMonth = [];
			this.$emit('refresh');
		},
		update: function (today, month) {
			this.transToday = today;
			if (month)	this.transMonth = month;
		}
	}
});

