'use strict'
document.getElementById('fullscreen')
	.addEventListener('click', function (e) {
		e.preventDefault()
		e.stopPropagation()
		document.documentElement.webkitRequestFullScreen()
	})

document.getElementById('exit-fullscreen')
	.addEventListener('click', function (e) {
		e.preventDefault()
		e.stopPropagation()
		document.webkitExitFullscreen()
	})
