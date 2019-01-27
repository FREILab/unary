Vue.component('deposit', {
	template: `
	<b-modal ref="modal" :id="domId" hide-footer size="lg" centered
		header-bg-variant="success" header-text-variant="light"
		@show="amount = '0'"
	>
		<template slot="modal-title">
			Geld einzahlen
			(<strong>{{user.username}}</strong>, Guthaben <balance :user="user"></balance>)
		</template>
		<p>Bitte entscheide dich für den Betrag, den du einzahlen möchtest,
		und werfe diesen in die Spendekasse auf dem Tresen.</p>
		<p class="text-center text-primary"><b>Scheine werden klar bevorzugt! Bitte nur ganze Eurobeträge!</b></p>
		<p>Bestätige dann, wieviel Geld in die Kasse gelegt hast:</p>

		<b-row class="my-4">
			<b-col v-for="a in ['5', '10', '20', '30', '50']" :key="a">
				<b-button @click="amount = a"
					variant="warning" block size="lg"
				>
					€ {{format_money(a)}}
				</b-button>
			</b-col>
		</b-row>
		<b-form inline centered>
			<label :for="domId + '-amount'" size="lg" class="mr-2">Betrag in €</label>
			<b-form-input :id="domId + '-amount'"
				type="number" v-model="amount" required min="0" max="100" step="any" style="width: 5em;"
				size="lg"
			></b-form-input>
			<b-button @click="$emit('deposit', amount)"
				:disabled="!amount"
				variant="danger" class="ml-auto" size="lg"
			>
				Einzahlung bestätigen
			</b-button>
		</b-form>
	</b-modal>
	`,
	props: {
		user: {
			required: true
		},
		domId: {
			default: 'deposit'
		}
	},
	data: function () {
		return {
			amount: '0'
		};
	},
	methods: {
		format_money: value => Number.parseFloat(value).toFixed(2),
		close: function () { this.$refs.modal.hide(); }
	}
});
