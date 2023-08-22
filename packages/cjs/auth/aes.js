'use strict'

// WIP for encription and decryption using AES

const crypto = require('crypto')

const DEFAULT_ENCODING = 'base64'

const encryptText = (alg, key, iv, text, encoding = DEFAULT_ENCODING) => {
  const cipher = crypto.createCipheriv(alg, key, iv)
  encoding = encoding || 'binary'
  let result = cipher.update(text, 'utf8', encoding)
  result += cipher.final(encoding)
  return result
}

const decryptText = (alg, key, iv, text, encoding = DEFAULT_ENCODING) => {
  const decipher = crypto.createDecipheriv(alg, key, iv)
  encoding = encoding || 'binary'
  let result = decipher.update(text, encoding)
  result += decipher.final()
  return result
}

const genIv = () => new Buffer.alloc(16, crypto.pseudoRandomBytes(16))

const genKey = (algorithm, password) => {
  let hash, key
  if (algorithm.includes("256")) {
    hash = crypto.createHash('sha256') // NOSONAR
    hash.update(password)
    key = new Buffer.alloc(32,hash.digest('hex'),'hex')
  } else if (algorithm.includes("192")) {
    hash = crypto.createHash('sha192') // NOSONAR
    hash.update(password);
    key = new Buffer.alloc(24,hash.digest('hex'),'hex')
  } else if (algorithm.includes("128")) {
    hash = crypto.createHash('md5') // NOSONAR
    hash.update(password)
    key = new Buffer.alloc(16,hash.digest('hex'),'hex')
  }
  return key
}

const test_aes = (
  data = 'This is a test',
  password = 'pw',
  algorithm = 'aes256') => {
  const [iv, key] = [genIv(), genKey(algorithm, password)]
  console.log('Data, Password, Algo:', data, password, algorithm)
  console.log('Key/Salt(iv): ', key.toString(DEFAULT_ENCODING), iv.toString(DEFAULT_ENCODING))
  const encText = encryptText(algorithm, key, iv, data)
  const decText = decryptText(algorithm, key, iv, encText)
  console.log('Encrypted: ' + encText)
  console.log('Decrypted: ' + decText);  
}

// test_aes()

module.exports = {
  genIv,
  genKey,
  encryptText,
  decryptText
}