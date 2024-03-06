## Description

This project contains reusable and shared JS code for use in JS projects.

The following libraries are:
- [node](libs/node/README.md) - Common JS reusables
- [esm](libs/esm/README.md) - ES Modules reusables

The common tools are:
- [tools/dbdeploy/README.md]() - deploying a database using the following suppored clients
  - Knex (sqlite, mysql, postgres, mssql, snowflake, ...)
  - Mongo client


## Workspace

1. listing workspaces `npm ls -ws`

2. Updating major version by workspace `npm i @node-saml/node-saml@latest --workspace=libs/node`


## Updating

```bash
npm outdated
# may need to edit the package.json file if library is in yellow
npm update --save
```


## Publishing packages to npm

### Update Version

**IMPORTANT** before publish, bump version in each project using `npm version` command (see npm version --help for explanation)

```bash
# see package.json on more info
npm run patch:node # for libs/node
npm run patch:esm # for libs/esm
```

###  Publish Package

```bash
# npm publish --access public --workspace=<workspace>
# need to use --access public as it is scoped package on free plan
npm run pub:node # for libs/node
npm run pub:esm # for libs/esm

# OR Publish using Github Actions .github/workflows/npm-publish.yml (add AUTH TOKEN from npm to Github Secrets)
```

## References

- https://www.aspecto.io/blog/lerna-hello-world-how-to-create-a-monorepo-for-multiple-node-packages/
- https://dev.to/cesarwbr/how-to-set-up-github-actions-to-publish-a-monorepo-to-npm-54ak
- https://github.com/marketplace/actions/publish-to-npm-monorepo
- https://docs.github.com/en/actions/publishing-packages/publishing-nodejs-packages
- https://nathanfries.com/posts/docker-npm-workspaces
