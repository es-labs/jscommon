let keyv
const setTokenService = (service) => keyv = service
const setRefreshToken = async (id, refresh_token) => keyv.set(id, refresh_token)
const getRefreshToken = async (id) => keyv.get(id)
const revokeRefreshToken = async(id) => keyv.delete(id)

export {
  setTokenService,
  setRefreshToken,
  getRefreshToken,
  revokeRefreshToken
}