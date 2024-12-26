'use strict'
const path = require('path')
module.exports = async function(app_path) {
  process.env.NODE_ENV = process.env.NODE_ENV || '' // development, uat, production...
  const { NODE_ENV, VAULT } = process.env
  if (!NODE_ENV) {
    console.log('Exiting No Environment Specified')
    process.exit(1)
  }

  const { version, name } = require(path.join(app_path, 'package.json'))
  process.env.APP_VERSION = version
  process.env.APP_NAME = name

  if (NODE_ENV) {
    if (VAULT && VAULT !== 'unused') {
      try {
        const vaultRes = await fetch(VAULT) // a GET with query parameters (protected)
        const vaultConfig = await vaultRes.json()
        global.CONFIG = { ...CONFIG, ...vaultConfig }
      } catch (e) {
        console.log('vault error', e.toString(), VAULT)
      }
    }
    const sleep = (milliseconds) => new Promise(resolve => setTimeout(resolve, milliseconds))
    await sleep(2000)
    console.log('CONFIG DONE!')
  } else {
    console.log('NODE_ENV and APP_PATH needs to be defined')
  }
}
