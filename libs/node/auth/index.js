'use strict'

const otplib = require('otplib')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

//NOSONAR const uuid = require('uuid/v4')
//NOSONAR const qrcode = require('qrcode')

//TOREMOVE let COOKIE_HTTPONLY, COOKIE_SAMESITE, COOKIE_SECURE, COOKIE_MAXAGE, COOKIE_DOMAIN,
//   AUTH_REFRESH_URL, AUTH_USER_FIELD_LOGIN, AUTH_USER_FIELD_PASSWORD, AUTH_USER_FIELD_GAKEY, AUTH_USER_FIELD_ID_FOR_JWT, AUTH_USER_FIELDS_JWT_PAYLOAD,
//   JWT_REFRESH_STORE, AUTH_USER_STORE, AUTH_USER_STORE_NAME, JWT_REFRESH_STORE_NAME,

let setRefreshToken, getRefreshToken, revokeRefreshToken, setRefreshTokenStoreName, setTokenService, setUserService,
  findUser, updateUser,
  setAuthUserStoreName

const {
  COOKIE_HTTPONLY, COOKIE_SAMESITE, COOKIE_SECURE, COOKIE_MAXAGE, COOKIE_DOMAIN,
  AUTH_REFRESH_URL, AUTH_USER_FIELD_LOGIN, AUTH_USER_FIELD_PASSWORD, AUTH_USER_FIELD_GAKEY, AUTH_USER_FIELD_ID_FOR_JWT, AUTH_USER_FIELDS_JWT_PAYLOAD = '',
  JWT_REFRESH_STORE='keyv',
  AUTH_USER_STORE,
  AUTH_USER_STORE_NAME,
  JWT_REFRESH_STORE_NAME,

  USE_OTP,
  JWT_ALG, JWT_EXPIRY, JWT_REFRESH_EXPIRY,
  JWT_PRIVATE_KEY, JWT_CERTIFICATE, JWT_REFRESH_PRIVATE_KEY, JWT_REFRESH_CERTIFICATE, JWT_SECRET, JWT_REFRESH_SECRET,
  JWT_ALLOW_INSECURE_KEY_SIZES
} = process.env

const authFns = { // rename to authFns
  findUser: null,
  updateUser: null,
  revokeRefreshToken: null
}

const setup = (tokenService, userService) => {
  //NOSONAR ({ } = process.env);
  ({ setRefreshToken, getRefreshToken, revokeRefreshToken, setRefreshTokenStoreName, setTokenService } = require('./' + JWT_REFRESH_STORE)); // keyv, redis, knex
  ({ findUser, updateUser, setAuthUserStoreName, setUserService } = require('./' + AUTH_USER_STORE)); // knex
  authFns.findUser = findUser
  authFns.updateUser = updateUser
  authFns.revokeRefreshToken = revokeRefreshToken
  if (setTokenService) setTokenService(tokenService)
  if (setUserService) setUserService(userService)
  if (setRefreshTokenStoreName) setRefreshTokenStoreName(JWT_REFRESH_STORE_NAME)
  if (setAuthUserStoreName) setAuthUserStoreName(AUTH_USER_STORE_NAME)
}

// SameSite=None; must use with Secure;
// may need to restart browser, TODO set Max-Age, ALTERNATE use res.cookie, Signed?
const httpOnlyCookie = () => `HttpOnly;SameSite=${COOKIE_SAMESITE};`
  + (COOKIE_SECURE ? 'Secure;':'')
  + (COOKIE_MAXAGE ? 'MaxAge='+COOKIE_MAXAGE+';':'')
  + (COOKIE_DOMAIN ? 'domain='+COOKIE_DOMAIN+';':'')

//NOSONAR algorithm
// expiresIn
// issuer  = 'Mysoft corp' 
// subject  = 'some@user.com'
// audience  = 'http://mysoftcorp.in'
// ip
// We implement stateful refresh_token not stateless

//NOSONAR
// mode: sign, verify
// type: access, refresh
const getSecret = (mode, type) => {
  if (JWT_ALG.substring(0,2) === 'RS') {
    if (mode === 'sign') {
      return type === 'refresh' ? JWT_REFRESH_PRIVATE_KEY : JWT_PRIVATE_KEY
    } else {
      return type === 'refresh' ? JWT_REFRESH_CERTIFICATE : JWT_CERTIFICATE
    }
  }
  return type === 'refresh' ? JWT_REFRESH_SECRET : JWT_SECRET
}

// should use:
// sub - for user id (access_token & refresh_token)
// groups - for user groups (access_token only)
// all other user related information sent on initial login and stored using local storage
// do not catch exception here, let functions above handle
const createToken = async (user) => { // Create a tokens & data from user
  const user_meta = { }
  const options = { }

  const id = user[AUTH_USER_FIELD_ID_FOR_JWT]

  if (!id) throw Error('User ID Not Found')
  if (user.revoked) throw Error('User Revoked')

  const groups = user.groups

  const keys = AUTH_USER_FIELDS_JWT_PAYLOAD.split(',')
  for (const key of keys) {
    if (key && user[key] !== undefined) user_meta[key] = user[key]
  }

  options.allowInsecureKeySizes = !!JWT_ALLOW_INSECURE_KEY_SIZES
  options.algorithm = JWT_ALG
  options.expiresIn = JWT_EXPIRY
  const access_token = jwt.sign({ id, groups }, getSecret('sign', 'access'), options)

  options.expiresIn = JWT_REFRESH_EXPIRY
  const refresh_token = jwt.sign({ id }, getSecret('sign', 'refresh'), options) // store only ID in refresh token?
  await setRefreshToken(id, refresh_token) // store in DB or Cache
  return {
    access_token,
    refresh_token,
    user_meta
  }
}

const setTokensToHeader = (res, {access_token, refresh_token}) => {
  const _access_token = `Bearer ${access_token}`
  if (COOKIE_HTTPONLY) {
    res.setHeader('Set-Cookie', [
      `Authorization=${_access_token};Path=/;`+ httpOnlyCookie(),
      `refresh_token=${refresh_token};Path=${AUTH_REFRESH_URL};`+ httpOnlyCookie() // send only if path contains refresh
    ])
  } else {
    res.setHeader('Authorization', `${_access_token}`)
    res.setHeader('refresh_token', `${refresh_token}`)
  }
}

const authUser = async (req, res, next) => {
  // console.log('auth express', req.baseUrl, req.path, req.cookies, req.signedCookies)
  let access_token = null
  try {
    let tmp = req.cookies?.Authorization || req.header('Authorization') || req.query?.Authorization
    access_token = tmp.split(' ')[1]
  } catch (e) {
    return res.status(401).json({ message: 'Token Format Error' })
  }
  if (access_token) {
    try {
      let access_result = jwt.verify(access_token, getSecret('verify', 'access'), { algorithm: [JWT_ALG] }) // and options
      if (access_result) {
        req.decoded = access_result
        return next()
      } else {
        return res.status(401).json({ message: 'Access Error' })
      }  
    } catch (e) {
      if (e.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token Expired Error' })
      } else {
        console.log('auth err', e.name)
        return res.status(401).json({ message: 'Token Error' })
      }
    }
  } else {
    return res.status(401).json({ message: 'Token Missing' })
  }
}

const authRefresh = async (req, res) => { // get refresh token
  try {
    const refresh_token = req.cookies?.refresh_token || req.header('refresh_token') || req.query?.refresh_token // check refresh token & user - always stateful          
    const refresh_result = jwt.verify(refresh_token, getSecret('verify', 'refresh'), { algorithm: [JWT_ALG] }) // throw if expired or invalid
    const { id } = refresh_result
    let refreshToken = await getRefreshToken(id)
    if (String(refreshToken) === String(refresh_token)) { // ok... generate new access token & refresh token?
      const user = await findUser({ id })
      const tokens = await createToken(user) // 5 minute expire for login
      setTokensToHeader(res, tokens)
      return res.status(200).json(tokens)
    } else {
      return res.status(401).json({ message: 'Refresh Token Error: Uncaught' })              
    }
  } catch (err) { // use err instead of e (fix no-catch-shadow issue)
    console.log('authRefresh', err)
    return res.status(401).json({ message: 'Refresh Token Error' })
  }
}

module.exports = {
  setup,
  authFns,
  // findUser, updateUser,
  getSecret,
  createToken,
  setTokensToHeader,
  authUser,
  authRefresh,
  bcrypt,
  otplib
}

// do refresh token check from backend ?
/*
Signout across tabs
window.addEventListener('storage', this.syncLogout) 
//....
syncLogout (event) {
  if (event.key === 'logout') {
    console.log('logged out from storage!')
    Router.push('/login')
  }
}
async function logout () {
  inMemoryToken = null;
  const url = 'http://localhost:3010/auth/logout'
  const response = await fetch(url, { method: 'POST', credentials: 'include', })
  // to support logging out from all windows
  window.localStorage.setItem('logout', Date.now())
}
*/

// The user logs in with a login API call.
// Server generates JWT Token and refresh_token
// Server sets a HttpOnly cookie with refresh_token. jwt_token and jwt_token_expiry are returned back to the client as a JSON payload.
// The jwt_token is stored in memory.
// A countdown to a future silent refresh is started based on jwt_token_expiry

// https://hasura.io/blog/best-practices-of-using-jwt-with-graphql/
