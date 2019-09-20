'use strict'
document.getElementById('fullscreen').addEventListener('click', function(e) {
	e.preventDefault()
	e.stopPropagation()
	document.documentElement.requestFullscreen() ||
		document.documentElement.webkitRequestFullScreen()
})

document
	.getElementById('exit-fullscreen')
	.addEventListener('click', function(e) {
		e.preventDefault()
		e.stopPropagation()
		document.exitFullscreen() || document.webkitExitFullscreen()
	})
