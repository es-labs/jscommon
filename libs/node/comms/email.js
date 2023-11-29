'use strict'

const crypto = require('crypto')
const {
  SENDGRID_KEY,
  SENDGRID_SENDER_NAME,
  SENDGRID_SENDER_EMAIL,
  SENDGRID_TEMPLATE_ID,
  SENDGRID_URL = 'https://api.sendgrid.com/v3/mail/send'
} = process.env

/**
 * Send html email using SendGrid
 *
 * @param {String} to a recepient email address
 * @param {String} subject the subject of the email
 * @param {String} content concatenated of the email content in html format
 *
 * @example sendDynamicEmail('user@mail.com', 'Test Email', '<p>Hello world!</p>')
 */
exports.sendEmail = async (to, subject, content) => {
  try {
    if (!SENDGRID_KEY) throw new Error('SENDGRID_KEY is not defined')
    if (!SENDGRID_SENDER_NAME) throw new Error('SENDGRID_SENDER_NAME is not defined')
    if (!SENDGRID_SENDER_EMAIL) throw new Error('SENDGRID_SENDER_EMAIL is not defined')

    // generate random hash to prevent duplicate emails
    const hash = crypto
      .createHash('sha256')
      .update(new Date().toString())
      .digest('hex')
      .slice(0, 15)

    const body = {
      personalizations: [{ to: [{ email: to }] }],
      from: {
        name: SENDGRID_SENDER_NAME,
        email: SENDGRID_SENDER_EMAIL
      },
      subject,
      content: [
        {
          type: 'text/html',
          value: content
        }
      ],
      headers: {
        'X-Entity-Ref-ID': hash
      }
    }

    const headers = {
      Authorization: `Bearer ${SENDGRID_KEY}`,
      'Content-Type': 'application/json'
    }

    const response = await fetch(SENDGRID_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    })

    return response
  } catch (error) {
    throw error
  }
}

/**
 * @param {String} to a recepient email address
 * @param {String} subject the subject of the email
 * @param {String} content concatenated of the email content in html format
 *
 * @example sendDynamicEmail('user@mail.com', 'Test Email', '<p>Hello world!</p>')
 */
exports.sendDynamicEmail = async (to, subject, content) => {
  try {
    if (!SENDGRID_KEY) throw new Error('SENDGRID_KEY is not defined')
    if (!SENDGRID_SENDER_NAME) throw new Error('SENDGRID_SENDER_NAME is not defined')
    if (!SENDGRID_SENDER_EMAIL) throw new Error('SENDGRID_SENDER_EMAIL is not defined')
    if (!SENDGRID_TEMPLATE_ID) throw new Error('SENDGRID_TEMPLATE_ID is not defined')

    // generate random hash to prevent duplicate emails
    const hash = crypto
      .createHash('sha256')
      .update(new Date().toString())
      .digest('hex')
      .slice(0, 15)

    const body = {
      personalizations: [
        {
          to: [{ email: to }],
          dynamic_template_data: {
            subject: subject,
            content: content
          }
        }
      ],
      from: {
        name: SENDGRID_SENDER_NAME,
        email: SENDGRID_SENDER_EMAIL
      },
      template_id: SENDGRID_TEMPLATE_ID,
      headers: {
        'X-Entity-Ref-ID': hash
      }
    }

    const headers = {
      Authorization: `Bearer ${SENDGRID_KEY}`,
      'Content-Type': 'application/json'
    }

    const response = await fetch(SENDGRID_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    })

    return response
  } catch (error) {
    throw error
  }
}
