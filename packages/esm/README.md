## Description

Store JS files used by both frontend and backend

- Use ESM to avoid using webpack for compilation on frontend
- For backend refer to NodeJS document on how to use ESM in NodeJS (To Elaborate)

## Installation

1. from github (better for development)

```
npm install https://github.com/es-labs/esm#semver:^0.0.14
```

2. from npm

```
cd js-node/expressjs
npm i @es-labs/esm
```

## Publishing packages to npm

```bash
# need to use --access public as it is scoped package on free plan
cd @es-labs/esm
npm publish --access public
```

## Useful aliasing for web components


browser may already have these useful...

const $ = (selector, el = document) => el.querySelector(selector)
const $$ = (selector, el = document) => el.querySelectorAll(selector)

Element.prototype.on = Element.prototype.addEventListener
how to auto unload event listener?


---

## Custom Element (Web Component) Samples

### Signature Pad

A component for capturing signature using canvas (component name: vcxwc-sign-pad)

Component file location [sign-pad.js](sign-pad.js)

Example can be found on js-web/vue-vite DemoSignPad page

Example Usage file location [DemoSignPad.vue](https://github.com/ais-one/cookbook/blob/master/js-web/vue-vite/src/apps/web-demo/views/Demo/DemoSignPad.vue))

Features
- handle attibutes and properties
- pass in json attributes as string for canvas context settings
- css variables
- handle events
- interactive with vuejs v-model

Customizable Styles

```css
vcxwc-sign-pad {
  --vcxwc-sign-pad-background-color: #faa;
}
```

Attributes
- width
- height
- context2d: 2D drawing context settings
- value (v-model used here, input event is created)

### Web Cam

A component for capturing image using webcam (component name: vcxwc-web-cam)

Component file location [web-cam.js](web-cam.js)

Example can be found on js-web/vue-vite DemoWebCam page

Example Usage file location [DemoWebCam.vue]([../js-web/vue-vite/src/pages](https://github.com/ais-one/cookbook/blob/master/js-web/vue-vite/src/apps/web-demo/views/Demo/DemoWebCam.vue)

Features
- shadowDOM and litDOM
  - css variables
- shadowDOM
  - slots
  - slotted css and slot styles
  - slot events
  - use <link> to include other css files e.g. bulma, bootstrap
  - interactive with vuejs v-on

CSS Variables

```css
vcxwc-web-cam {
  --vcxwc-web-cam-top: 5%;
  --vcxwc-web-cam-right: 5%;
}
```

Attributes
- width
- height

Slots
- button-snap
- button-unsnap

Event Emitted
- snap


TBD - Using web component inside a web component - its possible

- https://www.udemy.com/course/fundamentals-of-web-components
- https://github.com/basarbk/web-components-fundamentals.git
