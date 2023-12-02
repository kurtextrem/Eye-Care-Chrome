'use strict'

var form = document.forms[0]
form.addEventListener('change', function() {
	var interval = +form.interval.value,
		badge = form.badge.checked,
		delay = +form.delay.value

	chrome.storage.local.set({
		interval,
		sound: form.sound.checked,
		badge,
		delay,
	})
	chrome.alarms.create('notify', {
		delayInMinutes: interval,
		periodInMinutes: interval,
	})
	chrome.alarms.get('notify', function(details) {
		update(details.scheduledTime, badge)
	})
	if (badge)
		chrome.alarms.create('badge', {
			delayInMinutes: 10,
			periodInMinutes: 10,
		})
	else {
		chrome.alarms.clear('badge')
		chrome.action.setBadgeText({ text: '' })
	}
})

function load() {
	chrome.storage.local.get(
		{ interval: 20, sound: true, badge: false, delay: 20 },
		function(data) {
			form.interval.value = data.interval
			form.delay.value = data.delay
			form.sound.checked = data.sound
			form.badge.checked = data.badge
		}
	)
	chrome.alarms.get('notify', function(details) {
		update(details.scheduledTime)
	})
}

function update(time, badge) {
	const date = new Date(time)
	document.getElementById('notification').innerText = date.toLocaleTimeString()

	if (badge) {
		const mins = Math.round((time - Date.now()) / 1000 / 60)
		const string = mins + 'min'
		chrome.action.setTitle({ title: 'Next alarm in ' + string })
		chrome.action.setBadgeText({ text: string })
		chrome.action.setBadgeBackgroundColor({ color: '#E0E0E0' }) // #BDBDBD
	} else
		chrome.action.setTitle({
			title: 'Next alarm at' + date.toLocaleTimeString(),
		})
}

window.addEventListener('load', load)
