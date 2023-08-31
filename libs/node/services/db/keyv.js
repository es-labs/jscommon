'use strict'

const Keyv = require('keyv')

module.exports = class StoreKeyV {
	constructor(options = JSON.parse(process.env.KEYV_CACHE || null) || {}) {
    this._KEYV_CACHE = options
    this._keyv = null
  }
  open () {
    this._keyv = this._KEYV_CACHE ? new Keyv(this._KEYV_CACHE) : new Keyv()
    this._keyv.on('error', err => console.error('keyv Connection Error', err))
  }
  get () { return this._keyv }
  close () { this._keyv = null }
}
