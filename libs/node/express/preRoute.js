module.exports = (app, express) => {
  const {
    ENABLE_LOGGER,
    CORS_OPTIONS,
    // CORS_ORIGINS,
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
  try {
    console.log({ HELMET_OPTIONS })
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

  // Set CORS headers so client is able to communicate with this server
  // Access-Control-Allow-Origin=*
  // Access-Control-Allow-Methods=GET,POST,PUT,PATCH,DELETE,OPTIONS
  // Access-Control-Allow-Headers=Content-Type
  const cors = require('cors')
  console.log('cors setting up')
  try {
    console.log({ CORS_OPTIONS })
    const corsOptions = JSON.parse(CORS_OPTIONS || null)
    app.use(corsOptions ? cors(corsOptions) : cors()) // default { origin: '*' }
    console.info('cors setup done')
  } catch (e) {
    console.error('[cors setup error]', e.toString())
    throw(new Error())
  }

  // express-limiter, compression, use reverse proxy

  // ------ body-parser and-cookie parser ------
  const { BODYPARSER_JSON, BODYPARSER_URLENCODED, BODYPARSER_RAW_ROUTES = '' } = process.env
  // look out for... Unexpected token n in JSON at position 0 ... client request body must match request content-type, if applicaion/json, body cannot be null/undefined
  console.log('bodyparser setting up')
  try {
    console.table({ BODYPARSER_RAW_ROUTES, BODYPARSER_JSON, BODYPARSER_URLENCODED })
    app.use((req, res, next) => {
      const p2r = require('path-to-regexp')
      const rawMatch = BODYPARSER_RAW_ROUTES?.split(',').find(route => p2r(route).test(req.originalUrl))
      if (rawMatch) { // raw routes - ignore bodyparser json
        next()
      } else {
        express.json( JSON.parse(BODYPARSER_JSON || null) || { limit: '2mb' })(req, res, next)
      }
    })
    app.use(express.urlencoded( JSON.parse(BODYPARSER_URLENCODED || null) || { extended: true, limit: '2mb' })) // https://stackoverflow.com/questions/29175465/body-parser-extended-option-qs-vs-querystring/29177740#29177740
    console.info('bodyparser setup done')
  } catch (e) {
    console.error('[bodyparser setup error]', e.toString());
    throw(new Error())
  }

  const cookieParser = require('cookie-parser')
  console.log({ COOKIE_SECRET })
  app.use(cookieParser(COOKIE_SECRET))

  return this // this is undefined...
}
