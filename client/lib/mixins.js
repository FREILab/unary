var moneyMixin = {
	methods: {
		format_money: value => Number.parseFloat(value).toFixed(2)
	}
};

var modalMixin = {
	props: {
		domId: { required: true	}
	},
	data: () => ({
		visible: false
	}),
	methods: {
		onShow() { this.visible = true; },
		onHide(doReset) {
			if (doReset !== false)
				this.reset();
			this.visible = false;
		},
		close() { this.$refs.modal.hide(); },
		reset() { Object.assign(this.$data, this.$options.data.apply(this)); }
	},
}
