'use strict'

var audioElement = document.createElement('audio')
audioElement.src = chrome.extension.getURL('Bing-sound.mp3')
audioElement.volume = 0.3

var opt = {
	type: 'basic',
	title: 'Take a break from the screen!',
	message: 'Look at least 6 meters (20 feet) away from the screen.',
	priority: 2,
	iconUrl: 'eye.png',
	buttons: [{
		title: 'Open green screen'
	}]
}

var audio = true

chrome.alarms.onAlarm.addListener(function _notify(alarm) {
	if (Date.now() - alarm.scheduledTime > 60000)
		return // we don't want to fire, as alarm was hold back > 1min; Probably shut down Chrome etc.

	notify()
})

function notify() {
	play()
	chrome.notifications.create(undefined, opt, function (id) {
		window.setTimeout(function () {
			play()
			audioElement = undefined
			chrome.notifications.clear(id)
		}, 20000)

		chrome.notifications.onButtonClicked.addListener(function buttonListener() {
			chrome.tabs.create({ url: chrome.extension.getURL('greenscreen.html') })
			chrome.notifications.clear(id)
			chrome.notifications.onButtonClicked.removeListener(buttonListener)
		})

		chrome.notifications.onClicked.addListener(function listener() {
			chrome.notifications.clear(id)
			chrome.notifications.onClicked.removeListener(listener)
		})
	})
}

function play() {
	if (audio && audioElement)
		audioElement.play()
}

chrome.runtime.onInstalled.addListener(function listener() {
	chrome.storage.local.get({ interval: 20, audio: true }, function (data) {
		audio = data.audio
		chrome.alarms.clear('notify', function () {
			chrome.alarms.create('notify', { delayInMinutes: data.interval, periodInMinutes: data.interval })
		})
	})
})
