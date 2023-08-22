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
    const corsOptions = JSON.parse(CORS_OPTIONS || null)
    // if (corsOptions) { // maybe not needed
    //   let { origin } = corsOptions // origin = ['http://example1.com', 'http://example2.com']
    //   if (CORS_ORIGINS) origin = CORS_ORIGINS  
    //   let allowList = origin.split(',')
    //   if (allowList.length === 1) origin = allowList[0]
    //   else if (allowList.length > 1) {
    //     origin = function (_origin, callback) {
    //       if(!_origin || _origin === 'null') return callback(null, true) // allow requests with no origin (like mobile apps or curl requests)
    //       if (allowList.indexOf(_origin) !== -1) {
    //         return callback(null, true)
    //       } else {
    //         return callback(new Error('Not allowed by CORS'), false)
    //       }
    //     }
    //   }
    //   if (origin) corsOptions.origin = origin  
    // }
    app.use(corsOptions ? cors(corsOptions) : cors()) // default { origin: '*' }
    console.info('cors setup done')
  } catch (e) {
    console.error('[cors setup error]', e.toString());
    throw(new Error())
  }

  // express-limiter, compression, use reverse proxy

  // ------ body-parser and-cookie parser ------
  const { BODYPARSER_JSON, BODYPARSER_URLENCODED } = process.env
  // look out for... Unexpected token n in JSON at position 0 ... client request body must match request content-type, if applicaion/json, body cannot be null/undefined
  console.log('bodyparser setting up')
  try {
    app.use(express.json( JSON.parse(BODYPARSER_JSON || null) || { limit: '2mb' }))
    app.use(express.urlencoded( JSON.parse(BODYPARSER_URLENCODED || null) || { extended: true, limit: '2mb' })) // https://stackoverflow.com/questions/29175465/body-parser-extended-option-qs-vs-querystring/29177740#29177740
    console.info('bodyparser setup done')
  } catch (e) {
    console.error('[bodyparser setup error]', e.toString());
    throw(new Error())
  }

  const cookieParser = require('cookie-parser')
  app.use(cookieParser(COOKIE_SECRET))

  // ------ OPENAPI ------
  // if serving multiple documents
  // const swaggerDocumentOne = require('./swagger-one.json');
  // const swaggerDocumentTwo = require('./swagger-one.json');
  // app.use('/api-docs-one', swaggerUi.serveFiles(swaggerDocumentOne, options), swaggerUi.setup(swaggerDocumentOne));
  // app.use('/api-docs-two', swaggerUi.serveFiles(swaggerDocumentTwo, options), swaggerUi.setup(swaggerDocumentTwo));
  // load from multiple URLs
  // var options = {
  //   explorer: true,
  //   swaggerOptions: {
  //     urls: [
  //       { url: 'http://petstore.swagger.io/v2/swagger.json', name: 'Spec1' },
  //       { url: 'http://petstore.swagger.io/v2/swagger.json', name: 'Spec2' }
  //     ]
  //   }
  // }
  const { OPENAPI_PATH, OPENAPI_VALIDATOR } = process.env
  if (OPENAPI_PATH) {
    const swaggerUi = require('swagger-ui-express')
    app.use('/api-docs1', swaggerUi.serve, swaggerUi.setup(require('yamljs').load(OPENAPI_PATH), { explorer: true }))
    if (OPENAPI_VALIDATOR) {
      const OpenApiValidator = require('express-openapi-validator')
      app.use(OpenApiValidator.middleware(JSON.parse(OPENAPI_VALIDATOR)))
    }
  }

  // TODELETE const passport = require('passport')
  // app.use(passport.initialize())
  // passport.serializeUser((user, done) => { done(null, user) })
  // passport.deserializeUser((user, done) => { done(null, user) })
  
  return this // this is undefined...
}
