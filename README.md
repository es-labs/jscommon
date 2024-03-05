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

## Publishing packages to npm

**IMPORTANT** before publish, bump version in each project using `npm version` command (see npm version --help for explanation)

**Example** - Updating version for node project

```bash
npm run patch:node
```

Publish using Github actions (add AUTH TOKEN from npm to Github Secrets)

or...use `npm publish` command

**Example** - Npm publish for esm project

```bash
npm run patch:esm

# need to use --access public as it is scoped package on free plan
npm publish --access public
```


### References

- https://www.aspecto.io/blog/lerna-hello-world-how-to-create-a-monorepo-for-multiple-node-packages/
- https://dev.to/cesarwbr/how-to-set-up-github-actions-to-publish-a-monorepo-to-npm-54ak
- https://github.com/marketplace/actions/publish-to-npm-monorepo
- https://docs.github.com/en/actions/publishing-packages/publishing-nodejs-packages
- https://nathanfries.com/posts/docker-npm-workspaces
