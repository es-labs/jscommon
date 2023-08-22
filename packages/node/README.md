## Description

Common JS libraries for NodeJS applications

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

```bash
npm i @es-labs/node
```

## Publishing packages to npm

**IMPORTANT** before publishing bump version using `npm version` command (see npm version --help for explanation)

Use Github actions or...

```bash
# need to use --access public as it is scoped package on free plan
npm publish --access public
```
