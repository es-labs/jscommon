'use strict'

// Setting up webhook: https://api.telegram.org/bot{my_bot_token}/setWebhook?url={url_to_send_updates_to}
// Querying webhook: https://api.telegram.org/bot{my_bot_token}/getWebhookInfo
/*
{
  update_id: 165679876,
  message: {
    message_id: 3,
    from: {
      id: 183535134,
      is_bot: false,
      first_name: 'A',
      last_name: 'Gong 💻',
      username: 'aaronjxz',
      language_code: 'en'
    },
    chat: {
      id: 183535134,
      first_name: 'A',
      last_name: 'Gong 💻',
      username: 'aaronjxz',
      type: 'private'
    },
    date: 1694045266,
    text: '11'
  }
}
*/


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
