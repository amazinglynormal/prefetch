# Prefetch

Prefetch is a zero-dependency library for dynamically prefetching web pages.

## Quick start

With [npm](https://npmjs.org) installed, run:

```sh
npm install @amazinglynormal/prefetch
```

```js
// index.js
import { watch } from "@amazinglynormal/prefetch";

window.addEventListener("DOMContentLoaded", () => {
    watch();
});
```

This basic usage will use all default options:

Watch all anchor tags `<a>` that link to same-site resources.
Prefetch any link that come into the viewport.
If more than one anchor links to the same resource, it will only
be requested _once_.

**_Note:_**
If your user has save-data enabled or a slow connection is detected,
no prefetch request will be sent.

## API

### watch([options])

`watch` can be confgured by passing an _optional_ options object.

#### options.elements: HTMLAnchorElement | NodeList

**Note:** If neither options.elements or options.selectors are passed in the options object, default selector of "a" is used.

_Default:_ null

The anchor element `<a>` or NodeList of anchor elements you wish to watch.

#### options.selectors: string[]

**Note:** If neither options.elements or options.selectors are passed in the options object, default selector of "a" is used.

_Default:_ null

An array of CSS selectors to query in the document and watch.

#### options.delayMilliseconds: number

_Default:_ 0

The number of milliseconds anchor element `<a>` must be in the viewport before prefetch request is triggered.

#### options.ignore: string[]

_Default:_ []

An array of [hrefs](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a#href) you want ignored. This option overrides both options.elements and options.selectors.

#### options.inViewThreshold: number (0 - 1)

_Default:_ 0

The percentage of the element visible in the viewport before prefetch request is triggered. An inViewThreshold of 1 means 100% of element must be in viewport for the prefetch request to trigger.

## Other Resources

- [Web.dev's guide to prefetching](https://web.dev/articles/link-prefetch)
- [Google's quicklink project](https://github.com/GoogleChromeLabs/quicklink)

## License

[ISC](./LICENSE)
