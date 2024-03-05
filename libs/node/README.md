## Description

Common JS libraries for NodeJS applications

- auth: authorization
- comms:  for communications
- express: for express JS
- services: various services
  - db: databases
  - mq: TODO
  - others gcp, keyv, redis, webpush, websocket
- utils: various utilities
  - aes: encrypt & decrypt
- config.js: config loader
- package.json
- packageInfo.js: some package information for now
- README.md
- traps.js: error trapping

Refer to [https://github.com/es-labs/express-template]() project for usage

## TDOD

- setup github actions to auto increment package json version for `libs/node` & `libs/esm` when deploying to npm
  - https://aboutbits.it/blog/2021-03-11-using-github-actions-to-perfom-npm-version-increment
- setup unit tests
