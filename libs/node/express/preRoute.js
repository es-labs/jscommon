'use strict'

const preRoute = (app, express) => {
  const {
    ENABLE_LOGGER,
    CORS_OPTIONS, // CORS_ORIGINS no longer in use
    CORS_DEFAULTS,
    HELMET_OPTIONS,
    COOKIE_SECRET = (parseInt(Date.now() / 28800000) * 28800000).toString()
  } = process.env

  // ------ LOGGING ------
  if (ENABLE_LOGGER) {
    const morgan = require('morgan')
    app.use(morgan('combined', { stream: process.stdout, skip: (req, res) => res.statusCode < 400 })) // errors
    app.use(morgan('combined', { stream: process.stderr, skip: (req, res) => res.statusCode >= 400 })) // ok
  }

  // ------ SECURITY ------
  const helmet = require('helmet')
  console.log('helmet setting up')
  console.table({ HELMET_OPTIONS })
  try {
    const helmetOptions = JSON.parse(HELMET_OPTIONS || null)
    if (helmetOptions) {
      if (helmetOptions.nosniff) app.use(helmet.noSniff())
      if (helmetOptions.xssfilter) app.use(helmet.xssFilter())
      if (helmetOptions.hideServer) app.use(helmet.hidePoweredBy())
      if (helmetOptions.csp) app.use(helmet.contentSecurityPolicy(helmetOptions.csp))
    }
    // app.use(helmet.noCache())
    // csurf not needed at the moment  
    console.log('helmet setup done')
  } catch (e) {
    console.error('[helmet setup error]', e.toString());
    throw(new Error())
  }

    // -------- CORS --------
  // Set CORS headers so client is able to communicate with this server
  // Access-Control-Allow-Origin=*
  // Access-Control-Allow-Methods=GET,POST,PUT,PATCH,DELETE,OPTIONS
  // Access-Control-Allow-Headers=Content-Type, Authorization
  const cors = require('cors')
  console.log('cors setting up')
  console.table({ CORS_OPTIONS, CORS_DEFAULTS })
  try {
    const corsOptions = JSON.parse(CORS_OPTIONS || null)
    app.use(corsOptions ? cors(corsOptions) : cors()) // default { origin: '*' }
    console.info('cors options done')
  } catch (e) {
    console.error('[cors options error]', e.toString())
    throw(new Error())
  }
  // Set CORS defaults if certain CORS headers are missing
  try {
    const corsDefaults = JSON.parse(CORS_DEFAULTS || null)
    if (corsDefaults) {
      app.use((req, res, next) => {
        for (const key in corsDefaults) {
          if (!res.get(key)) res.set(key, corsDefaults[key])
        }
        next()
      })
    }
  } catch (e) {
    console.error('[cors defaults error]', e.toString())
    throw(new Error())
  }

  // express-limiter, compression, use reverse proxy

  const cookieParser = require('cookie-parser')
  console.log({ COOKIE_SECRET })
  app.use(cookieParser(COOKIE_SECRET))

  return this // this is undefined...
}

module.exports = preRoute
