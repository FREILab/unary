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
		onShow: function () { this.visible = true; },
		onHide: function () { this.visible = false; },
		close: function () { this.$refs.modal.hide(); }
	},
}
