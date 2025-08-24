Vue.component('history-modal', {
	mixins: [moneyMixin, modalMixin],
	template: `
	<b-modal :id="domId" static="true"
		hide-footer size="lg"
		hide-backdrop content-class="shadow"
		header-bg-variant="dark" header-text-variant="light"
		@show="onShow(); $emit('refresh')" @hidden="onHide"
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
				<template #cell(product)="data">
					<b-img v-if="data.item.product"
						height="20" rounded
						:src="'static/img/products/' + data.item.product.picture">
					</b-img>
					{{ data.value }}
					<small v-if="data.item.fulfilled">
						<i class="text-success fas fa-check"></i>
					</small>
				</template>
				<template #cell(cancel)="data">
					<b-button v-if="!(data.item.cancelled || data.item.fulfilled)"
						@click="$emit('revert', data.item.id)"
						variant="warning" size="sm"
					>
						<i class="fas fa-backspace"></i> Zurücknehmen
					</b-button>
				</template>
			</b-table>
		</template>
		<p v-else-if="initialized">Heute noch nichts getrunken? 😾</p>
		<div v-else class="d-flex justify-content-center">
			<i class="p-4 m-4
				rounded-circle border border-warning
				fas fa-wrench fa-10x fa-spin">
			</i>
		</div>

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
	data() {
		let f = {
			product: { key: 'product', label: 'Produkt', tdClass: this.style_product, formatter: this.format_product },
			date: { key: 'date', label: 'Uhrzeit', formatter: this.format_date },
			amount: { key: 'amount', label: 'Betrag', class: 'text-right', tdClass: this.style_money, formatter: this.format_money },
			cancel: { key: 'cancel', label: '', tdClass: 'button text-right'},
		}
		return {
			fieldsToday: [f.product, f.date, f.amount, f.cancel],
			fieldsMonth: [f.product, f.amount],
			initialized: false,
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
		update(today, month) {
			this.transToday = today;
			if (month)	this.transMonth = month;
			this.initialized = true;
		}
	}
});

