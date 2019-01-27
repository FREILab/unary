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
      this.tween(oldValue, newValue)
    }
  },
  mounted: function () {
    this.tween(0, this.value)
  },
  methods: {
	dynamicDuration: function (distance) {
		return this.duration * Math.log(Math.abs(distance) + 1);
	},
    tween: function (startValue, endValue) {
      var vm = this
      function animate () {
        if (TWEEN.update()) {
          requestAnimationFrame(animate)
        }
      }

      new TWEEN.Tween({ tweeningValue: startValue })
        .to({ tweeningValue: endValue }, this.dynamicDuration(endValue - startValue))
        .onUpdate(function () {
          vm.tweeningValue = this.tweeningValue.toFixed(vm.decimals)
        })
        .start()

      animate()
    }
  }
})

