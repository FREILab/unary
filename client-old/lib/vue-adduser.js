/* equiv. to text.lower().encode('utf-8')).hexdigest() on the server side */
let digest = async function(text) {
	const data = new TextEncoder().encode(text.toLowerCase());
	const buffer = await window.crypto.subtle.digest('SHA-256', data);
	const byteArray = new Uint8Array(buffer);
	const hexCodes = [...byteArray].map(value => {
		return value.toString(16).padStart(2, '0');
	});
	return hexCodes.join('');
};

Vue.component('adduser-modal', {
	mixins: [modalMixin],
	components: {
		'color-picker': VueColor.Slider
	},
	template: `
	<b-modal ref="modal" :id="domId" static="true"
		size="lg" centered
		hide-backdrop content-class="shadow"
		header-bg-variant="success" header-text-variant="light"
		title="Neuen Nutzer registrieren"
		@show="onShow" @hidden="onHide"
		no-close-on-esc no-close-on-backdrop hide-header-close
	>
	<div v-show="step == 0" v-html="template.disclaimer"></div>
	
	<div v-show="step == 1">
		<b-form @submit.prevent="form_submit">
			<b-form-group
				label="Dein Spitzname" valid-feedback="Hört sich ganz gut an"
				description="Name unter dem du dich wiederfindest (z.B. Hans M). Für alle sichtbar."
				:label-cols="4"
				:label-for="domId + '-username'"
				:state="valid.username" :invalid-feedback="errors.username"
			>
				<b-form-input :id="domId + '-username'"
					:state="valid.username" v-model.trim="account.username">
				</b-form-input>
			</b-form-group>
			<b-form-group
				label="Dein echter Name" valid-feedback="Klingt plausibel"
				description="Dein voller Name, zur klaren Zuordnung. Versteckt."
				:label-cols="4"
				:label-for="domId + '-fullname'"
				:state="valid.fullname" :invalid-feedback="errors.fullname"
			>
				<b-form-input :id="domId + '-fullname'"
					:state="valid.fullname" v-model.trim="account.fullname">
				</b-form-input>
			</b-form-group>
			<b-form-group
				label="Deine Email-Adresse" valid-feedback="Klingt plausibel"
				description="Nur für direkte Kommunikation zum Konto. Versteckt."
				:label-cols="4"
				:label-for="domId + '-email'"
				:state="valid.email" :invalid-feedback="errors.email"
			>
				<b-form-input :id="domId + '-email'" type="email"
					:state="valid.email" v-model.trim="account.email">
				</b-form-input>
			</b-form-group>
			<div class=form-row>
				<b-col md="4">
					Deine Farbe
				</b-col>
				<b-col>
					<color-picker :value="account.color" @input="account.color=$event.hex"
						:swatches="['.45', '.35', '.3', '.25', '.2']"
						style="width: 98.5%"
					>
					</color-picker>
					<small class="form-text text-muted mt-3">
						Deine Lieblingsfarbe zur schnellen Wiedererkennung.
					</small>
				</b-col>
			</div>
		</b-form>
	</div>

	<template v-if="step > 1 && step < lastStep">
		<div v-html="template.intro"></div>
		<hr>
		<p><strong><i>Frage {{ step - 1 }}:</i> {{ template.questions[step-2].q }}</strong></p>
		<b-btn
			v-for="(a, i) in template.questions[step-2].a" :key="i"
			:variant="buttonVariant[step-2][i]" block class="mb-2"
			@click="answer(step - 2, i)"
		>
			{{ a }}
		</b-btn>
	</template>

	<template v-if="step == lastStep">
		<div v-html="template.outro"></div>
		<b-row>
			<b-col md="4" class="user m-auto mt-md-3">
				<user-card :user="account" border-variant="primary"></user-card>
			</b-col>
		</b-row>
	</template>

	<template slot="modal-footer">
		<b-btn @click="close" variant="danger" class="mr-auto">
			Abbrechen
		</b-btn>
		<b-btn v-show="step > 0" @click="step -= 1">Zurück</b-btn>

		<b-btn v-show="step == 0" @click="step += 1">Einverstanden</b-btn>
		<b-btn v-show="step == 1"
			@click="form_submit" :disabled="!allValid"
		>Weiter</b-btn>
		<b-btn v-show="step > 1 && step < lastStep"
			@click="step +=1"
			:disabled="answers[step-2] < 0"
			:variant="(answers[step-2] > -1 ? 'success' : null)"
			class="fade-bg"
		>Weiter</b-btn>
		<b-btn v-show="step == lastStep"
			@click="finalize" variant="success"
		>Abschließen</b-btn>
	</template>
	</b-modal>
	`,
	props: {
		template: { required: true, type: Object },
		users: { required: true, type: Array },
	},
	data() {
		return {
			step: 0,
			account: {
				username: '', fullname: '', email: '', color: '#732626',
				picture: 'generic.png',
				emailDigest: '' // computed asynchronously
			},
			answers: this.template.questions.map(q => -1),
		}
	},
	watch: {
		'account.email'(text) { // trigger digest computation for emailDigest
			digest(text).then(digest => this.account.emailDigest = digest);
		}
	},
	computed: {
		lastStep() { return 2 + this.template.questions.length; },
		errors() {
			let a = this.account;
			let u = "", f = "", e = "";
			if (a.username.length == 0)
				u = "Bitte angeben";
			if (a.username.length > 10)
				u = "Bitte wähle einen kürzeren Namen";
			if (this.users.find(u => u.username.toLowerCase() === a.username.toLowerCase()))
				u = "Dieser Name ist schon vergeben 😼";
			if (!a.fullname.match(/\w+( \w+)+/))
				f = "Bitte gib Vor- und Nachnamen an";
			if (!a.email.match(/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/))
				e = "Bitte gib eine gültige Email-Adresse an";
			if (this.users.find(u => u.emailDigest === a.emailDigest))
				e = "Diese Email-Adresse gehört bereits zu einem anderen Konto 🙀";
			return {username: u, fullname: f, email: e};
		},
		valid() {
			return Object.assign(...Object.entries(this.errors).map(([k, v]) => ({[k]: !v})));
		},
		allValid() {
			return Object.entries(this.valid).reduce((sum, [k, v]) => sum && v, true)
		},
		buttonVariant() {
			// determine all button outfits based on quiz state (answered, wrong answer, etc)
			let a = this.answers;
			return this.template.questions.map((q, i) =>
				q.a.map(function (_, j) {
					if (j == q.correct - 1 && a[i] > -1)
						return 'success';
					else if (j == a[i])
						return 'outline-danger';
					else
						return 'outline-primary';
				})
			);
		}
	},
	methods: {
		form_submit() {
			if (this.allValid)
				this.step += 1;
		},
		answer(i, j) {
			// effectively disable buttons without visual feedback we don't like
			if (this.answers[i] < 0)
				this.$set(this.answers, i, j);
		},
		finalize() {
			this.$emit('create', this.account);
			// TODO: modal closes, the user has to re-do everything on fail
			this.close();
		}
	}
});

