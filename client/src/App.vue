<script>
import { defineComponent } from 'vue'
import HelloWorld from './components/HelloWorld.vue'

export default defineComponent({
  name: 'App',
  components: {
    HelloWorld,
  },
  mixins: [moneyMixin],
	data: {
		products: initial.products.sort(productCompare),
		users: initial.users.sort(userCompare),
		addUserTemplate: initial.newUser,
		currentUser: null,
		userFilter: '',
		userTimeout : null,
		connected: socket.connected,
		showErrorAlert: false,
		lastServerError: ''
	},
	computed: {
		filteredUsers() {
			return this.users.filter(u => {
				if (u.id == 1) // TODO: see guestUser below
					return false;
				let filter = this.userFilter.toLowerCase();
				// allow a broad filter on real name
				let pre = u.namePrefix.toLowerCase();
				if (pre.startsWith(filter.slice(0, pre.length)))
					return true;
				return u.username.toLowerCase().startsWith(filter);
			});
		},
		guestUser() {
			// TODO: hack, maybe mark on the server or deliver separately?
			return this.users.find(u => u.id == 1);
		},
		favoriteUsers() {
			let latest = this.users.filter(u => (u !== this.guestUser && u.lastActivity));
			latest.sort((a, b) => Date.parse(b.lastActivity) - Date.parse(a.lastActivity));
			return latest.slice(0, 5);
		}
	},
	methods: {
		update_timeout() {
			// add/update a simple timeout that returns to user selection
			if (this.userTimeout)
				clearTimeout(this.userTimeout);
			this.userTimeout = setTimeout(() => this.deselect_user(), 60000)
		},
		select_user(user) {
			this.currentUser = user;
			// start deselection timeout
			this.update_timeout();
		},
		deselect_user() {
			this.currentUser = null;
			// remove user filter (considered outdated)
			this.userFilter = '';
			// ensure there are no leftover popups
			if ('products' in this.$refs)
				this.$refs['product'].forEach((p) => p.clear_popups());
		},
		fetch_transactions(parameters) {
			socket.emit('transactions', {uid: this.currentUser.id, ...parameters}, ret => {
				if (ret.success) {
					this.$refs.history.update(ret.today, ret.month);
				} else {
					this.lastServerError = ret.message;
					this.showErrorAlert = true;
				}
			});
		},
		transact(task, parameters) {
			this.update_timeout(); // honor user action
			return new Promise((resolve, reject) => {
				if (!this.connected) {
					reject("Verzögerte Transaktion verhindert.");
					return;
				}
				if (!this.currentUser) {
					reject("Kein Nutzer ausgewählt!");
					return;
				}
				socket.emit(task, {uid: this.currentUser.id, ...parameters}, ret => {
					if (ret.success) {
						resolve(ret);
					} else {
						this.lastServerError = ret.message;
						this.showErrorAlert = true;
						reject(ret.message);
					}
				});
			}).catch((msg) => console.warn('Transaktionsfehler: ' + msg));
		},
		buy(product) {
			this.transact('purchase', {pid: product.id}).then(
				() => this.$refs.product.find(c => c.product.id === product.id).add_popup()
			);
		},
		deposit(amount) {
			this.transact('purchase', {amount: -amount}).then(
				() => this.$refs.deposit.close() // TODO: provide explicit positive feedback
			);
		},
		revert(tid) {
			this.transact('revert', {tid: tid}).then(
				() => this.fetch_transactions({short: true}) // sync current state
				// note: we do not follow our philosophy of push notifications as it is a tailored list
			);
		},
		add_user(account) {
			socket.emit('add user', account, ret => {
				if (!ret.success) {
					this.lastServerError = ret.message;
					this.showErrorAlert = true;
				}
			});
		}
	}
})
</script>

<template>
	<div id="app" ref="app" v-cloak>
		<transition-group name="slide" class="slide" tag="div">
		
		<!-- PRODUCT VIEW -->
		<div key="products" v-if="currentUser" class="w-100 fullscreen">
			<b-navbar :style="{ backgroundColor: currentUser.color }" type="dark" :toggleable="true">
				<template v-if="currentUser != guestUser">
					<b-navbar-brand>Hallo, {{ currentUser.username }}!</b-navbar-brand>
					<b-navbar-brand>
						Dein Guthaben: <balance-text :user="currentUser"></balance-text>
					</b-navbar-brand>
					<b-navbar-nav>
						<b-button-group>
							<b-button v-b-modal.history variant="secondary">
								<i class="fas fa-history"></i>
								Letzte Transaktionen
							</b-button>
							<b-button v-b-modal.deposit variant="success">
								<i class="fas fa-box"></i>
								Geld einzahlen
							</b-button>
						</b-button-group>
					</b-navbar-nav>
				</template>
				<template v-else>
					<b-navbar-brand>
						Getränkeabgabe auf <strong class="bg-danger">freiwilliger Spendenbasis</strong>.
						<small>Abgabe nur an Gäste — Vereinsmitglieder bitte eigenes Konto anlegen!</small>
					</b-navbar-brand>
					<b-navbar-nav>
						<b-button v-b-modal.history variant="secondary">
							<i class="fas fa-history"></i>
							Letzte Transaktionen
						</b-button>
					</b-navbar-nav>
				</template>
			</b-navbar>
			<b-container fluid>
				<b-row class="mt-2 mb-2" align-h="between" align-v="end">
					<b-col>
						<h1>Was möchtest du?</h1>
					</b-col>
					<b-col cols="3">
						<b-button @click="deselect_user"
							variant="primary" block size="lg"
							class="done"
						>
							Fertig
						</b-button>
					</b-col>
				</b-row>
				<b-card-group
					v-for="i in Math.ceil(products.length / 5)" :key="i"
					deck class="mb-4"
				>
					<product-card
						v-for="p in products.slice((i-1)*5, i*5)"
						:key="p.id"
						ref="product"
						:product="p" @order="buy(p)"
						style="max-width: 18%"
					></product-card>
				</b-card-group>
			</b-container>
		</div>

		<!-- USER VIEW -->
		<div key="users" v-show="currentUser == null" class="w-100 fullscreen">
			<b-navbar variant="dark" type="dark" :toggleable="true" sticky>
				<b-navbar-brand>Zum Wohl!</b-navbar-brand>
				<b-nav-text class="text-light">
					Getränkeabrechnung im Freilab
				</b-nav-text>
			</b-navbar>
			<b-container fluid>
				<b-row class="mt-2 mb-2" align-h="between" align-v="center">
					<b-col cols="3">
						<h1>Wer trinkt?</h1>
					</b-col>
					<b-col>
						<b-form-input v-model.trim="userFilter"
							type="search" placeholder="Name suchen"
							size="lg"
						></b-form-input>
					</b-col>
					<b-col offset="1" cols="2">
						<b-button v-b-modal.adduser
							variant="success" block size="lg"
						>
							Ich bin neu
						</b-button>
					</b-col>
				</b-row>
				<!-- <b-collapse id="patrons" :visible="!userFilter"> -->
				<div id="patrons" v-show="!userFilter">
					<b-row>
						<b-col v-for="u in favoriteUsers" :key="u.id"
							sm="6" md="4" lg="3" xl="2"
							class="user">
							<user-card :user="u" @select="select_user(u)"
								class="favorite"
							></user-card>
						</b-col>
						<b-col v-if="guestUser"
							sm="6" md="4" lg="3" xl="2"
							class="user ml-auto">
							<user-card :user="guestUser" @select="select_user(guestUser)"
								class="guest"
							></user-card>
						</b-col>
					</b-row>
				</div>
				<!--</b-collapse>-->
				<hr :class="{slowfade: true, gone: userFilter}">
				<b-row>
					<b-col v-for="u in filteredUsers" :key="u.id"
						sm="6" md="4" lg="3" xl="2"
						class="mb-4 user">
						<user-card :user="u" @select="select_user(u)"
						></user-card>
					</b-col>
				</b-row>
			</b-container>
		</div>
		</transition-group>
		<b-modal class="not-fullscreen"
			:visible="true" no-close-on-esc no-close-on-backdrop
			hide-footer hide-header size="lg" centered
		>
			<b-button @click="$refs.app.requestFullscreen();"
				block size="lg" variant="outline-danger"
			>
				<i class="far fa-play-circle"></i>
				Getränkeabrechnungssystem im Vollbild starten
			</b-button>
		</b-modal>

		<b-alert variant="danger" fade
			:show="!connected"
		>
			<i class="float-left text-danger fas fa-2x fa-bolt" style="margin-right: 1ex;"></i>
			Verbindung zum Server unterbrochen!
		</b-alert>
		<b-alert variant="danger" dismissible fade
			:show="showErrorAlert" @dismissed="showErrorAlert=false"
		>
			<i class="float-left text-danger fas fa-3x fa-bolt" style="margin-right: 1ex;"></i>
			Ups, da ist etwas schiefgelaufen!
			Bitte versuch es noch einmal oder melde das Problem:
			<p><b>{{ lastServerError }}</b></p>
		</b-alert>

		<!-- MODALS – pre-render on startup (no v-if usage) -->
		<history-modal dom-id="history" ref="history"
			:user="currentUser" @refresh="fetch_transactions" @revert="revert">
		</history-modal>
		<deposit-modal dom-id="deposit" ref="deposit"
			:user="currentUser" @deposit="deposit">
		</deposit-modal>
		<adduser-modal dom-id="adduser"
			:template="addUserTemplate" :users="users" @create="add_user">
		</adduser-modal>
	</div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
