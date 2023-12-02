'use strict'

let sound = null,
	delay = 20,
	badge = false

/**
 *
 */
function updateBadge() {
	chrome.alarms.get('notify', function(alert) {
		const mins = Math.round((alert.scheduledTime - Date.now()) / 1000 / 60)
		const string = mins + 'min'
		chrome.action.setTitle({ title: 'Next alarm in ' + string })
		chrome.action.setBadgeText({ text: string })
		chrome.action.setBadgeBackgroundColor({ color: '#E0E0E0' }) // #BDBDBD
	})
}

chrome.alarms.onAlarm.addListener(function _notify(alarm) {
	if (alarm.name === 'notify') {
		if (Date.now() - alarm.scheduledTime > 60000) return // we don't want to fire, as alarm was hold back > 1min; Probably shut down Chrome etc.

		notify()
	} else if (alarm.name === 'badge') {
		updateBadge()
	}
})

/**
 *
 */
function notify() {
	play()

	let i = delay
	const interval = setInterval(function() {
		--i
		chrome.action.setBadgeText({ text: i + 's' })
		chrome.action.setBadgeBackgroundColor({ color: '#81C784' })
	}, 1000)

	chrome.notifications.create(
		'eyecare',
		{
			type: 'basic',
			title: 'Take a break from the screen',
			message:
				'For at least ' +
				delay +
				' s, look at least 6 m/20 ft away from the screen.',
			priority: 2,
			iconUrl: 'eye.png',
			buttons: [
				{
					title: 'Open green screen',
				},
			],
		},
		function(id) {
			setTimeout(function() {
				play()
				chrome.notifications.clear('eyecare')
				clearInterval(interval)

				chrome.action.setBadgeText({ text: '' })
				if (badge) updateBadge()
				else
					chrome.alarms.get('notify', function(details) {
						if (details === undefined) return

						const date = new Date(details.scheduledTime)
						chrome.action.setTitle({
							title: 'Next alarm at' + date.toLocaleTimeString(),
						})
					})
			}, delay * 1000)
		}
	)
}

chrome.notifications.onButtonClicked.addListener(function buttonListener() {
	chrome.tabs.create({ url: chrome.runtime.getURL('greenscreen.html') })
	chrome.notifications.clear('eyecare')
	chrome.notifications.onButtonClicked.removeListener(buttonListener)
})

chrome.notifications.onClicked.addListener(function listener() {
	chrome.notifications.clear('eyecare')
	chrome.notifications.onClicked.removeListener(listener)
})

/**
 *
 */
function play() {
	if (sound === null) {
		chrome.storage.local.get({ sound: true, delay: 20, badge: false }, function(
			data
		) {
			sound = data.sound
			delay = data.delay
			badge = data.badge
			play()
		})
	} else if (sound) {
		playSound(chrome.runtime.getURL('ding.ogg'))
	}
}

/**
 * Plays audio files from extension service workers
 * @param {string} source - path of the audio file
 * @param {number} volume - volume of the playback
 */
async function playSound(source = 'ding.ogg', volume = 0.5) {
    await createOffscreen();
    await chrome.runtime.sendMessage({ play: { source, volume } });
}

// Create the offscreen document if it doesn't already exist
async function createOffscreen() {
    if (await chrome.offscreen.hasDocument()) return;
    await chrome.offscreen.createDocument({
        url: 'offscreen.html',
        reasons: ['AUDIO_PLAYBACK'],
        justification: 'sound playback' // details for using the API
    });
}

chrome.runtime.onInstalled.addListener(function listener() {
	chrome.storage.local.get(
		{ interval: 20, sound: true, badge: false, delay: 20 },
		function(data) {
			chrome.alarms.get('notify', function(alert) {
				chrome.alarms.create('notify', {
					delayInMinutes: alert === undefined ? data.interval : undefined,
					periodInMinutes: data.interval,
					when: alert === undefined ? undefined : alert.scheduledTime,
				})
			})

			if (data.badge) {
				chrome.alarms.create('badge', {
					delayInMinutes: 10,
					periodInMinutes: 10,
				})
				updateBadge()
			} else {
				chrome.alarms.clear('badge')
			}
		}
	)
})
