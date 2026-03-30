let redis
const setTokenService = (service) => redis = service
const setRefreshToken = async (id, refresh_token) => redis.set(id, refresh_token)
const getRefreshToken = async (id) => redis.get(id)
const revokeRefreshToken = async(id) => redis.del(id)
export {
  setTokenService,
  setRefreshToken,
  getRefreshToken,
  revokeRefreshToken
}