'use strict'

const webPush = require('web-push')
const vapidKeys = webPush.generateVAPIDKeys() // We use webpush to generate our public and private keys
const { publicKey, privateKey } = vapidKeys
const { WEBPUSH_VAPID_SUBJ } = process.env

try {
  if (WEBPUSH_VAPID_SUBJ) {
    console.log('webpush setup')
    webPush.setVapidDetails(WEBPUSH_VAPID_SUBJ, publicKey, privateKey) // We are giving webpush the required information to encrypt our data
    console.log('webpush setup done')
  } else {
    console.log('no webpush setup')
  }
} catch (e) {
  console.error('[webpush error]', e.toString())
}

// This function takes a subscription object and a payload as an argument. It will try to encrypt the payload
// then attempt to send a notification via the subscription's endpoint
// will throw exception if error
exports.send = async (subscription, payload, options = { TTL: 60 }) => {
  // This means we won't resend a notification if the client is offline
  // what if TTL = 0 ?
  // web-push's sendNotification function does all the work for us
  if (!subscription.keys) { payload = payload || null }
  return await webPush.sendNotification(subscription, payload, options) // will throw if error
}

exports.getPubKey = () => vapidKeys.publicKey
