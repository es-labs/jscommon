### 0.0.37

- added CHANGELOG.md file
- breaking changes in @node-saml/node-saml@5.0.0
  - https://github.com/node-saml/node-saml/blob/master/CHANGELOG.md#-major-changes
- include follow up middleware after using cors to set default headers if there is none
- added packageInfo.js to get package information - name, version, dependencies

### 0.0.38

- remove mongodb support
- remove http-proxy-middleware support

### 0.0.45

- standardize `authUser()` error returns in `auth/index.js`
- remove fileFilter options from multer configs in `express/postRoute.js`, let user roll this out

### TODO
- add testing to...
- add s3/oss handling