'use strict'

exports.send = async (to, title, body) => {
  // send firebase push notification
  // console.log('FCM TEST @es-labs/node/fcm.js', to, body, title, key)
  try {
    const FCM_URL = 'https://fcm.googleapis.com/fcm/send'
    const payload = {
      to,
      data: {
        notification: {
          title, body // icon: 'firebase-logo.png', click_action: 'http://localhost:8081'
        }
      }
    }
    const headers = {
      Authorization: 'key=' + process.env.FCM_SERVER_KEY,
      'Content-Type': 'application/json'
    }

    const res = await fetch(FCM_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    })
    const data = await res.json()
    console.log(data)
    return data

    // TODEPRECATE
    // const axios = require('axios')
    // const rv = await axios.post(FCM_URL, payload, { headers })
    // console.log('done', rv.data)
  } catch (e) {
    console.error('Firebase Messaging Error', e.toString())
    return null
  }
}
