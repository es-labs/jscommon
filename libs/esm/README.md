## Description

Store JS files used by both frontend and backend

- Use ESM to avoid using webpack for compilation on frontend
- For backend refer to NodeJS document on how to use ESM in NodeJS (To Elaborate)

## HTML Custom Elements / Web Components

### Useful aliasing for web components

```js
// browser may already have these $ / $$...
const $ = (selector, el = document) => el.querySelector(selector);
const $$ = (selector, el = document) => el.querySelectorAll(selector);

Element.prototype.on = Element.prototype.addEventListener;
// TBD: how to auto unload event listener?
```

### Custom Element (Web Component) Samples

#### Signature Pad

A component for capturing signature using canvas (component name: vcxwc-sign-pad)

Component file location [sign-pad.js](sign-pad.js)

Example Usage in [https://github.com/es-labs/vue-antd-template]() file location `src/apps/web-sample/views/Demo/DemoSignPad.vue`

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

#### Web Cam

A component for capturing image using webcam (component name: vcxwc-web-cam)

Component file location [web-cam.js](web-cam.js)

Example Usage in [https://github.com/es-labs/vue-antd-template]() file location `src/apps/web-sample/views/Demo/DemoWebCam.vue`

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
