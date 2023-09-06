'use strict'
// https://www.npmjs.com/package/ws
// NOTE: if --forcedExit --detectOpenHandles in JEST test, will cause error
// TODO: automated testing for websockets
const WebSocket = require('ws')
const https = require('https')

// NOSONAR
// function heartbeat() {
//   clearTimeout(this.pingTimeout)
//   // Use `WebSocket#terminate()` and not `WebSocket#close()`. Delay should be
//   // equal to the interval at which your server sends out pings plus a
//   // conservative assumption of the latency.
//   this.pingTimeout = setTimeout(() => {
//     this.terminate()
//   }, 30000 + 1000)
//   const client = new WebSocket('wss://echo.websocket.org/')
//   client.on('open', heartbeat)
//   client.on('ping', heartbeat)
//   client.on('close', function clear() {
//   clearTimeout(this.pingTimeout)
// })
// let WSServer = require('ws').Server
// // Create web socket server on top of a regular http server
// let wss = new WSServer({ server })
// server.on('request', app)

module.exports = class Wss {
  constructor(options = JSON.parse(process.env.WS_OPTIONS || null) || {}) {
    if (!Wss._instance) {
      Wss._instance = this
      this._port = options.WS_PORT
      this._keepAliveMs = options.WS_KEEEPALIVE_MS
      this._wss = null
      this._onClientConnect = (ws) => { }
      this._onClientClose = (ws) => { }
      this._onClientMessage = async (data, isBinary, ws, wss) => { // client incoming message
        const message = isBinary ? data : data.toString()
        // console.log('message', message)
        try { // try-catch only detect immediate error, cannot detect if write failure    
          if (wss) { // send to other clients except self
            wss.clients.forEach((client) => {
              if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message) // send message to others 
              }
            })
            // ws.send('something', function ack(error) { console.log }) // If error !defined, send has been completed, otherwise error object will indicate what failed.
            ws.send(message) // echo back message...
          }
        } catch (e) {
          console.log(e.toString())
        }
      }  
    }
    return Wss._instance
  }
  static getInstance() {
    return this._instance
  }
  setOnClientMessage(onClientMessageFn) {
    this._onClientMessage = onClientMessageFn
  }
  setOnClientConnect(onClientConnectFn) { //  what to do when client connects
    this._onClientConnect = onClientConnectFn
  }
  setOnClientCLose(onClientCloseFn) { //  what to do when client closes
    this._onClientClose = onClientCloseFn
  }
  
  get() {
    return this._instance
  }

  send(data) {
    this._wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data)
      }
    })
  }
  
  open(server=null, app=null) {
    const { HTTPS_PRIVATE_KEY, HTTPS_CERTIFICATE } = process.env
    let err
    try {
      if (!this._wss && this._port) {
        if (HTTPS_CERTIFICATE) {
          if (!server) server = https.createServer({
            key: HTTPS_PRIVATE_KEY, cert: HTTPS_CERTIFICATE
          }).listen(this._port) // use same port, create server because of graphql subscriptions
          this._wss = new WebSocket.Server({ server })
        } else {
          if (!server) this._wss = new WebSocket.Server({ port: this._port }) // use seperate port
          else this._wss = new WebSocket.Server({ server })
        }
        if (app) server.on('request', app)
  
        console.log('WS API listening on port ' + this._port)
        if (this._wss) {
          this._wss.on('connection', (ws) => {
            // console.log('ws client connected')
            this._onClientConnect(ws) // what else to do when client connects
            ws.isAlive = true
            ws.on('pong', () => { ws.isAlive = true })
            ws.on('close', () => this._onClientClose(ws))
            ws.on('message', (data, isBinary) => this._onClientMessage(data, isBinary, ws, this._wss))
          })
          setInterval(() => { // set keep-alive
            // console.log('WS Clients: ', this._wss.clients.size)
            this._wss.clients.forEach((ws) => {
              if (!ws.isAlive) return ws.terminate() // force close
              ws.isAlive = false
              return ws.ping(() => {}) // NOSONAR
            })
          }, this._keepAliveMs)
        }
      } else {
        console.log('NO WS Service To Open')
      }
    } catch (e) {
      err = e.toString()
    }
    console.log('WS Open ' + (err ? err : 'Done'))
    return this
  }
  
  close () {
    try { // close all connections
      if (this._wss) {
        this._wss.close()
        // this._wss.clients.forEach(client => client.close(0, 'wss close() called')) // close gracefully
        for (const client of this._wss.clients) client.terminate() // https://github.com/websockets/ws/releases/tag/8.0.0
        this._wss = null //delete wss
      }
    } catch (e) {
      console.error(e.toString())
    }
    console.log('WS API CLOSE OK')
  } 
}
