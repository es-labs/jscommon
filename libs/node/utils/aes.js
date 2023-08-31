'use strict'
const crypto = require('crypto')
const DEFAULT_ENCODING = 'base64' // 'binary'

const encryptText = (alg, key, iv, text, encoding = DEFAULT_ENCODING) => {
  const cipher = crypto.createCipheriv(alg, key, iv)
  return cipher.update(text, 'utf8', encoding) + cipher.final(encoding)
}

const decryptText = (alg, key, iv, text, encoding = DEFAULT_ENCODING) => {
  const decipher = crypto.createDecipheriv(alg, key, iv)
  return decipher.update(text, encoding) + decipher.final()
}

const genIv = () => new Buffer.alloc(16, crypto.pseudoRandomBytes(16))

const genKey = (algorithm, password) => {
  const [size, algo] = algorithm.includes("256") ? [32, 'sha256'] :
    algorithm.includes("192") ? [32, 'sha192'] :
    algorithm.includes("128") ? [32, 'md5'] : []
  const hash = crypto.createHash(algo)
  hash.update(password)
  return new Buffer.alloc(size, hash.digest('hex'),'hex')
}

const test_aes = (data = 'test data', password = 'pw', algorithm = 'aes256') => {
  const [iv, key] = [genIv(), genKey(algorithm, password)]
  const encText = encryptText(algorithm, key, iv, data)
  const decText = decryptText(algorithm, key, iv, encText)
  console.log('Password:', password)
  console.log('Key: ', key.toString(DEFAULT_ENCODING))
  console.log('Plaintext: ' + decText)
  console.log('Encrypted (aes256): ' + encText)
}

if (process?.argv[2] === 'test') test_aes()

module.exports = {
  genIv,
  genKey,
  encryptText,
  decryptText
}