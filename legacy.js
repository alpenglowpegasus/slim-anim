var anim = (function() {
	(function () {
		if (typeof window.CustomEvent === 'function') return false

		function CustomEvent(event, params) {
			params = params || { bubbles: false, cancelable: false, detail: undefined }
			var evt = document.createEvent('CustomEvent')
			evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail)
			return evt
		}

		CustomEvent.prototype = window.Event.prototype

		window.Event = CustomEvent
	})()

	var easings = {
		linear: function(t) { return t },
		easeInQuad: function(t) { return t * t },
		easeOutQuad: function(t) { return t * (2 - t) },
		easeInOutQuad: function(t) { return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t },
		easeInCubic: function(t) { return t * t * t },
		easeOutCubic: function(t) { return (--t) * t * t + 1 },
		easeInOutCubic: function(t) { return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1 },
		easeInQuart: function(t) { return t * t * t * t },
		easeOutQuart: function(t) { return 1- (--t) * t * t * t },
		easeInOutQuart: function(t) { return t < .5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t },
		easeInQuint: function(t) { return t * t * t * t * t },
		easeOutQuint: function(t) { return 1 + (--t) * t * t * t * t },
		easeInOutQuint: function(t) { return t < .5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t }
	}

	function normalize(value, min, max) {
		return Math.abs((value - min) / (max - min))
	}

	function denormalize(value, min, max) {
		return (value * (max - min) + min)
	}

	function closest(arr, num) {
		return arr.reduce(function(prev, cur) {
			return (Math.abs(cur - num) < Math.abs(prev - num) ? cur : prev)
		})
	}

	function setFPS() {
		var event = new Event('animReady')
		if (window.FPS) return
		if (!!window.MSInputMethodContext && !!document.documentMode) { window.FPS = 60; window.dispatchEvent(event); return }

		requestAnimationFrame(function(t1) {
			requestAnimationFrame(function(t2) { 
				var FPS = (1000 / (t2 - t1))
				window.FPS = closest([24, 30, 60, 75, 100, 120, 144, 155, 175, 240], FPS)
				window.dispatchEvent(event)
			})
		})
	}

	function spread(cur, from, to, over, easing) {
		var dir = to > from
		var dist = Math.abs(dir ? to - from : from - to)
		var step = dist * cur / over + from

		step = normalize(step, from, to)
		step = easing ? eval('easings.' + easing + '(step)') : easings.easeInOutCubic(step)
		step = denormalize(step, from, to)
		step = dir ? step : from - Math.abs((from - step))

		return step
	}

	function anim(el, props, set) {
		if (!el) return { preloadFPS: setFPS }
		if (!window.FPS) setFPS()
		if (!set) set = {}

		function animLoop() {
			var event = new Event(timestamp)
			var frameTime = 1 / window.FPS * 1000
			var dur = set.duration ? set.duration : 500
			var frames = Math.round(dur / frameTime)
			var count = 0
			var startValues = {}

			function tick() {
				for (var prop in props) {
					var propC = getComputedStyle(el)[prop]
					if (!startValues[prop]) startValues[prop] = el.style[prop] || prop === 'transform' ? el.style[prop] : propC
					if (!startValues[prop]) startValues[prop] = el[prop] ? el[prop].toString() : '0'
					if (startValues[prop] === '0') propC = true

					var reg = new RegExp('[-01234567890\.]', 'g')
					var from = startValues[prop]
					var fromN = from.match(reg) ? parseFloat(from.match(reg).join('')) : 0
					var to = props[prop]
					var toN = parseFloat(to.match(reg).join(''))
					var step = spread(count + 1, fromN, toN, frames, set.easing)

					if (propC) el.style[prop] = to.replace(to.match(reg).join(''), step)
					else el[prop] = step
				}

				count++
				if (count < frames) requestAnimationFrame(tick)
				else window.dispatchEvent(event)
			}

			requestAnimationFrame(tick)
		}

		var timestamp = Date.now().toString()

		if (!window.FPS) window.addEventListener('animReady', function() { animLoop(Date.now()) })
		else animLoop(Date.now())

		window.addEventListener(timestamp, function() {
			if (set.callback) set.callback()
			window.removeEventListener(timestamp, arguments.callee)
		})
	}

	return { a: anim }
})();
