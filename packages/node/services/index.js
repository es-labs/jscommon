'use strict'

const StoreKeyV = require('./db/keyv')
const StoreRedis = require('./db/redis')
const StoreKnex = require('./db/knex')
const StoreMongo = require('./db/mongodb') 

// const agenda = require('./mq/agenda') // TDB new MQ

// only one created
const websocket = require('./websocket')
const auth = require('../auth')

let sercicesConfig = []
const services = { }

const start = async (config = JSON.parse(process.env.SERVICES_CONFIG || null) || []) => {
  sercicesConfig = config
  sercicesConfig.foreach(svc => {
    const opts = process.env[svc.options]
    if (svc.type === 'knex') services[svc.name] = new StoreKnex(opts)
    if (svc.type === 'mongo') services[svc.name] = new StoreMongo(opts)
    if (svc.type === 'redis') services[svc.name] = new StoreRedis(opts)
    if (svc.type === 'keyv') services[svc.name] = new StoreKeyV(opts)

    if (svc.type === 'ws') services[svc.name] = websocket
    if (svc.type === 'auth') services[svc.name] = auth

    if (svc.type !== 'auth' && svc.type !== 'ws') {
      services[svc.name].open()
    }
    // ws and auth pass in functions... 
  })
  services?.websocket.open(null, null) // or set to null
  services?.auth.open(services?.keyv.get(), services?.knex1.get()) // setup authorization
}

const stop = async () => {
  // console.log('services - stop - begin')
  try {
    const promises = sercicesConfig.map(svc => services[svc.name].close())
    await Promise.allSettled(promises)
  } catch (e) {
    console.log(e.toString())
  }
  // console.log('services - stop - end')
}

module.exports = {
  start,
  stop,
  get: (service) => services[service],
  list: () => sercicesConfig
}