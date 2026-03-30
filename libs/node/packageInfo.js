import packageJson from './package.json' with { type: 'json' };

const { name, version, dependencies } = packageJson;

module.exports = {
  name,
  version,
  dependencies
}
