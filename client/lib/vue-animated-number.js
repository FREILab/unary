Vue.component('animated-number', {
	template: '<span>{{ tweeningValue }}</span>',
	props: {
		value: {
			type: Number,
			required: true
		},
		decimals: {
			type: Number,
			default: 0
		},
		duration: {
			type: Number,
			default: 500
		}
	},
	data: function () {
		return {
			tweeningValue: 0
		}
	},
	watch: {
		value: function (newValue, oldValue) {
			this.tween(oldValue, newValue);
		}
	},
	mounted: function () {
		this.tweeningValue = this.value.toFixed(this.decimals);
	},
	methods: {
		dynamicDuration: function (distance) {
			return this.duration * Math.log(Math.abs(distance) + 1);
		},
		tween: function (start, end) {
			var vm = this;
			function animate () {
				if (TWEEN.update()) {
					requestAnimationFrame(animate);
				}
			}

			new TWEEN.Tween({ tweeningValue: start })
				.to({ tweeningValue: end }, this.dynamicDuration(end - start))
				.onUpdate(function () {
					vm.tweeningValue = this.tweeningValue.toFixed(vm.decimals)
				})
				.start();
			animate();
		}
	}
});
