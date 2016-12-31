'use strict'

var form = document.forms[0]
form.addEventListener('change', function() {
	var interval = +form.interval.value
	chrome.storage.local.set({ interval: interval, sound: form.sound.checked })
	chrome.alarms.clear('notify', function () {
		chrome.alarms.create('notify', { delayInMinutes: interval, periodInMinutes: interval })
	})
})

function load(){
	chrome.storage.local.get({ interval: 20, sound: true }, function (data) {
		form.querySelector('option[value="' + data.interval + '"]').selected = true
		form.sound.checked = data.sound
	})
}

window.addEventListener('load', load)
