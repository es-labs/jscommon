const packageJson = require('./package.json')

const { name, version, dependencies } = packageJson

module.exports = {
  name,
  version,
  dependencies
}
