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

### options.triggerEvent: "inView" | "onHoverOrFocus" | "onPointerOrKeyDown"

_Default:_ "inView"

The UI event that triggers a prefetch request.

- `"inView"`: prefetch is triggered when element comes into viewport.
- `"onHoverOrFocus"`: prefetch is triggered when user hovers over the element with a mouse or when the element has received focus.

**Note:** Most Mobile devices do not have a "hover" state because there's no mouse pointer and focus can also be handled a bit differently on mobile browsers. Therefore, `"onHoverOrFocus"` may only be an appropriate option if you're primarily targeting desktop users.

- `onPointerOrKeyDown`: prefetch is triggered when pointerdown or "Enter" keydown event is on a element.

**Note:** Least aggressive prefetching strategy. It is more so used to give the request a head start as you can be almost certain user intends to go to linked page.

### options.elements: HTMLAnchorElement | NodeList

**Note:** If neither options.elements or options.selectors are passed in the options object, default selector of "a" is used.

_Default:_ null

The anchor element `<a>` or NodeList of anchor elements you wish to watch.

### options.selectors: string[]

**Note:** If neither options.elements or options.selectors are passed in the options object, default selector of "a" is used.

_Default:_ null

An array of CSS selectors to query in the document and watch.

### options.delayMilliseconds: number

_Default:_ 0

The number of milliseconds anchor element `<a>` must be in the viewport before prefetch request is triggered.

### options.ignore: string[]

_Default:_ []

An array of [hrefs](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a#href) you want ignored. This option overrides both options.elements and options.selectors.

### options.inViewThreshold: number (0 - 1)

_Default:_ 0

The percentage of the element visible in the viewport before prefetch request is triggered. An inViewThreshold of 1 means 100% of element must be in viewport for the prefetch request to trigger.

### options.prerenderWhenPossible: boolean

_Default: false_

[Please carefully consider which pages you would like to prerender](https://developer.mozilla.org/en-US/docs/Web/API/Speculation_Rules_API#unsafe_prerendering)

Will append make prerender rather than prefetch request.

**Note:** If Speculation Rules API is not supported by users browser, prefetch will be used as a fallback.

## Other Resources

- [Web.dev's guide to prefetching](https://web.dev/articles/link-prefetch)
- [Google's quicklink project](https://github.com/GoogleChromeLabs/quicklink)

## License

[MIT](./LICENSE)
