'use strict'

const { TELEGRAM_API_KEY, TELEGRAM_CHANNEL_ID } = process.env

exports.sendMsg = async (text, chatId = '') => {
  try {
    // console.log('text, chatId', text, chatId)
    //NOSONAR { id, date, pts, seq }
    if (!chatId) chatId = TELEGRAM_CHANNEL_ID // channel message
    return await fetch(`https://api.telegram.org/bot${TELEGRAM_API_KEY}/sendMessage?chat_id=${chatId}&text=${text}`)
  } catch (e) {
    return { err: e.toString() }
  }
}

exports.sendChannelMsg = async (text) => await sendMsg(text) // TODEPRECATE
