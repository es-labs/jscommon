## Description

Node JS only libraries for backend

- auth: authorization
- comms:  for communications
- express: for express JS
- services: various services
  - db: databases
  - mq: message queue
  - others gcp, keyv, redis, webpush, websocket
- config.js: config loader
- package.json
- traps.js: error trapping


Refer to [https://github.com/ais-one/cookbook/tree/master/js-node/expressjs](https://github.com/ais-one/cookbook/tree/master/js-node/expressjs) folder for usage


## Installation

1. from github (better for development)

```bash
npm install https://github.com/es-labs/node# # latest default

# or

npm install https://github.com/es-labs/node#0.0.15 # specific tag
```

2. from npm

```bash
npm i @es-labs/node
```

## Publishing packages to npm

```bash
# need to use --access public as it is scoped package on free plan
cd @es-labs/node
npm publish --access public
```
