const easings = {
	linear: t => t,
	easeInQuad: t => t * t,
	easeOutQuad: t => t * (2 - t),
	easeInOutQuad: t => t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
	easeInCubic: t => t * t * t,
	easeOutCubic: t => (--t) * t * t + 1,
	easeInOutCubic: t => t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
	easeInQuart: t => t * t * t * t,
	easeOutQuart: t => 1- (--t) * t * t * t,
	easeInOutQuart: t => t < .5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,
	easeInQuint: t => t * t * t * t * t,
	easeOutQuint: t => 1 + (--t) * t * t * t * t,
	easeInOutQuint: t => t < .5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t
}

const normalize = (value, min, max) => Math.abs((value - min) / (max - min))
const denormalize = (value, min, max) => (value * (max - min) + min)
const closest = (arr, num) => arr.reduce((prev, cur) => (Math.abs(cur - num) < Math.abs(prev - num) ? cur : prev))

function getFPS() {
	return new Promise(resolve => {
		requestAnimationFrame(t1 =>
			requestAnimationFrame(t2 => resolve(1000 / (t2 - t1)))
		)
	})
}

function setFPS() {
	if (!window.FPS) getFPS().then(FPS => {
		window.FPS = closest([24, 30, 60, 75, 100, 120, 144, 155, 175, 240], FPS)
		const event = new Event('animReady')
		window.dispatchEvent(event)
	})
}

function spread(cur, from, to, over, easing) {
	const dir = to > from
	const dist = Math.abs(dir ? to - from : from - to)
	let step = dist * cur / over + from

	step = normalize(step, from, to)
	step = easing ? eval(`easings.${easing}(step)`) : easings.easeInOutCubic(step)
	step = denormalize(step, from, to)
	step = dir ? step : from - Math.abs((from - step))

	return step
}

export default function anim(el, props, set) {
	if (!el) return { preloadFPS: setFPS }
	if (!window.FPS) setFPS()
	if (!set) set = {}

	function animLoop() {
		return new Promise(async function(resolve) {
			const frameTime = 1 / window.FPS * 1000
			const dur = set.duration ? set.duration : 500
			const frames = Math.round(dur / frameTime)
			let count = 0
			const startValues = {}

			function tick() {
				for (const prop in props) {
					const propC = getComputedStyle(el)[prop]
					if (!startValues[prop]) startValues[prop] = el.style[prop] || prop === 'transform' ? el.style[prop] : propC
					if (!startValues[prop]) startValues[prop] = el[prop].toString()

					const reg = new RegExp('[-01234567890\.]', 'g')
					const from = startValues[prop]
					let fromN = from.match(reg) ? parseFloat(from.match(reg).join('')) : 0
					const to = props[prop]
					let toN = parseFloat(to.match(reg).join(''))
					const step = spread(count + 1, fromN, toN, frames, set.easing)

					if (propC) el.style[prop] = to.replace(to.match(reg).join(''), step)
					else el[prop] = step
				}

				count++
				if (count < frames) requestAnimationFrame(tick)
				else resolve()
			}

			requestAnimationFrame(tick)
		})	
	}

	if (!window.FPS) window.addEventListener('animReady', function() { animLoop().then(set.callback) })
	else animLoop().then(set.callback)
}
