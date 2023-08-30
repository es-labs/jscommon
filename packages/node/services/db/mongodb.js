'use strict'
const { MongoClient, ObjectID } = require('mongodb')

module.exports = class StoreMongo {
	constructor(options = JSON.parse(process.env.MONGO_OPTIONS || null) || {}) {
    this._DEFAULT_TRANSACTION_OPTIONS = {
      readConcern: { level: 'local' },
      writeConcern: { w: 'majority' },
      readPreference: 'primary'
    }
    this._MONGO_URL = options.url
    this._MONGO_OPTIONS = options.opts
    this._mongo = {
      client: null,
      db: null,
      session: null,
      stream: null,
      defaultTransactionOptions: this._DEFAULT_TRANSACTION_OPTIONS,
      ObjectID: null
    }
  }

  async open() {
    this._mongo.ObjectID = ObjectID
    try {
      if (this._MONGO_URL) {
        const client = new MongoClient(this._MONGO_URL, this._MONGO_OPTIONS)
        // {
        //   useUnifiedTopology: true,
        //   useNewUrlParser: true,
        //   auth: { user: 'test', password: 'test123' },
        //   authMechanism: authMechanism,
        //   uri_decode_auth: true
        //   reconnectTries: 1000, // How To Set Infinity?
        //   poolSize: 10,
        //   reconnectInterval: 1000, // ms
        //   autoReconnect: true
        // }
        this._mongo.client = client
        // mongo.client.startSession({ defaultTransactionOptions })
        await client.connect()
        this._mongo.db = client.db()
        // NOSONAR
        // mongo.stream = db.db('mm').collection('exchangeUsers').watch() //  for streaming data
        // mongo.stream.on('change', (change) => {
        //   console.log(change); // You could parse out the needed info and send only that data.
        //   // use websocket to listen to changes
        // })
        console.log('mongodb CONNECTED', this._MONGO_URL)  
      }
    } catch (e) { console.log('mongodb CONNECT ERROR', this._MONGO_URL, e.toString()) }
  }
  async close() {
    if (this._mongo.client) {
      await this._mongo.client.close()
      this._mongo.client = null
      console.log('mongodb closed')
    }
  }
  get() { return this._mongo }
  setId(id) { return new ObjectID(id) }
}
