# slim-anim

slim-anim is a small (< 100 lines of code) javascript animation library for those who don't want the bloat (and don't need all the features) of the bigger animation libraries out there.

I personally only need javascript animations for transitioning height 0 -> auto, and animating the browser scroll position in 95% of my projects..

## Known shortcomings
* No color support
* Transform start value css needs to be inline
* No support for multiple transform values
* Probably a bunch of other stuff I didn't notice yet


## Installation

Module version (only modern browsers):

```bash
npm install slim-anim
```
Legacy version:    
For an oldschool, non-module version (with IE11 support) use the legacy.js file, and ```anim.a()``` instead of ```anim()```

## Parameters
anim( ```DOMElement``` ,  ```properties (Object)``` ,  ```settings (Object)``` )

Available settings:  

duration: ```Number```  
easing: ```String```  
callback: ```Function```



## Examples

```
import anim from 'slim-anim'

// simple example
anim(el, {top: '500px'})

// complex example
anim(el,
	{
		top: '500px',
		transform: 'scale(2)'
	}, 
	{
		duration: 1000, 
		easing: 'easeInOutQuart', 
		callback: function() { 
			anim(box, { top: '250px', left: '500px', borderRadius: '100px' }
		)}
	}
)

// slide-toggle ish example
function toggle(el) {
	if (el.offsetHeight > 0) {
		anim(el, { height: 0 + 'px' })
	} else {
		const oHeight = el.style.height
		el.style.height = ''
		const height = el.offsetHeight
		el.style.height = oHeight
		anim(el, { height: height + 'px' })
	}
}

// animate scroll example
anim(document.documentElement, { scrollTop: '0px' })
```

## Available easings
```linear, easeInQuad, easeOutQuad, easeInOutQuad, easeInCubic, easeOutCubic, easeInOutCubic, easeInQuart, easeOutQuart, easeInOutQuart, easeInQuint, easeOutQuint, easeInOutQuint```

## License
[MIT](https://choosealicense.com/licenses/mit/)
