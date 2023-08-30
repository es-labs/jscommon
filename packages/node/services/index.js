'use strict'

let servicesConfig = []
const services = { }

const start = async (
  config = JSON.parse(process.env.SERVICES_CONFIG || null) || [], server = null, app = null
) => {
  const serviceTypesAvailable = process.env.SERVICES_TYPES_AVAILABLE.split(',')
  const StoreKeyV = serviceTypesAvailable.includes('keyv') ? require('./db/keyv') : null
  const StoreKnex = serviceTypesAvailable.includes('knex') ? require('./db/knex') : null
  const StoreRedis = serviceTypesAvailable.includes('redis') ? require('./db/redis') : null
  const StoreMongo = serviceTypesAvailable.includes('mongo') ? require('./db/mongodb') : null
  
  // const agenda = require('./mq/agenda') // TDB new MQ  
  // only one created
  // const websocket = require('./websocket')
  const Wss = serviceTypesAvailable.includes('ws') ? require('./websocket') : null
  const auth = require('../auth')
  
  try {
    servicesConfig = config
    servicesConfig.forEach(svc => {
      const opts = JSON.parse(process.env[svc.options] || null)
      if (opts && svc.type === 'knex' && StoreKnex) services[svc.name] = new StoreKnex(opts)
      if (opts && svc.type === 'mongo' && StoreMongo) services[svc.name] = new StoreMongo(opts)
      if (opts && svc.type === 'redis' && StoreRedis) services[svc.name] = new StoreRedis(opts)
      if (opts && svc.type === 'keyv' && StoreKeyV) services[svc.name] = new StoreKeyV(opts)
      if (opts && svc.type === 'ws' && Wss) services[svc.name] = new Wss(opts)

      // if (svc.type === 'ws') services[svc.name] = websocket
      if (svc.type === 'auth') services[svc.name] = auth

      if (opts) {
        if (svc.type === 'ws') {
          services[svc.name].open(null, null) // set server or get app object
        }
        if (svc.type !== 'auth' && svc.type !== 'ws') {
          services[svc.name].open()
        }  
      }
    })
    // ws and auth pass in functions... 
    // services?.websocket.open(null, null) // or set to null
    services?.auth.open(services?.keyv.get(), services?.knex1.get()) // setup authorization
  } catch (e) {
    console.log(e)
  }
}

const stop = async () => {
  // console.log('services - stop - begin')
  try {
    const promises = servicesConfig.map(svc => services[svc.name].close())
    await Promise.allSettled(promises)
  } catch (e) {
    console.log(e.toString())
  }
  // console.log('services - stop - end')
}

module.exports = {
  start,
  stop,
  get: (service) => services[service].get(),
  list: () => servicesConfig
}