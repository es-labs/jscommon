'use strict'

const postRoute = (app, express) => {
  let  { UPLOAD_STATIC, WEB_STATIC } = process.env
  // app.set('case sensitive routing', true)

  // Upload URL, Should use Signed URL and get from cloud storage instead
  UPLOAD_STATIC = JSON.parse(UPLOAD_STATIC || null)
  if (UPLOAD_STATIC) {
    const serveIndex = require('serve-index') // connect-history-api-fallback causes problems, so do upload first

    UPLOAD_STATIC.forEach(item => {
      // TOREMOVE
      // if (item.options.fileFilter) {
      //   const allowedMimeTypes = item.options.fileFilter.allowedMimeTypes.split(',')
      //   const allowedExtensions = item.options.fileFilter.allowedExtensions.split(',')
      //   item.options.fileFilter = (req, file, cb) => { // better to also filter at frontend
      //     const fileExtension = file.originalname.split(".").pop();
      //     if (allowedExtensions.includes(fileExtension)) return cb(null, true)
      //     if ( allowedMimeTypes.find((mimeType) => file.mimetype.includes(mimeType)) ) return cb(null, true) // accept image or text
      //     return cb(null, false, new Error("Only text/plain or images are allowed"))
      //   }
      // }
      const { url, folder, list, listOptions } = item
      if (url && folder) {
        const authPlaceHolder = (req, res, next) => next() // TODO add auth here...
        app.use(url, authPlaceHolder, express.static(folder))
        if (list) app.use(url, serveIndex(folder, listOptions)) // allow file and directory to be listed
      }
    })
  }

  WEB_STATIC = JSON.parse(WEB_STATIC || null)
  const hasWebStatic = WEB_STATIC && WEB_STATIC.length
  if (hasWebStatic) {
    const history = require('connect-history-api-fallback')
    app.use(history()) // causes problems when using postman - set header accept application/json in postman
    WEB_STATIC.forEach(item => {
      app.use(item.url, express.static(item.folder, item.options)) // { extensions: ['html'], index: false }
    })
  }
  app.use("*", (req, res) => res.status(404).json({ Error: '404 Not Found...' }))

  return this
}

module.exports = postRoute
