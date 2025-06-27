import { isSaveDataEnabled, isSlowConnectionType } from "./network-information";
import { prefetch } from "./prefetch";

type IdleCallback = (
    callback: IdleRequestCallback,
    options?: IdleRequestOptions,
) => number;

type TriggerEvent = "inView" | "onHoverOrFocus";

interface Options {
    triggerEvent?: TriggerEvent;
    elements?: HTMLAnchorElement | NodeList;
    selectors?: string[];
    ignore?: string[];
    delayMilliseconds?: number;
    inViewThreshold?: number;
}

export function watch(options?: Options): void {
    if (isSaveDataEnabled()) {
        return;
    }

    // sets options or uses defaults
    const triggerEvent = options?.triggerEvent || "inView";
    const elements = options?.elements;
    const selectors = options?.selectors;
    const ignore = options?.ignore || [];
    const delayMilliseconds = options?.delayMilliseconds || 0;
    const inViewThreshold = options?.inViewThreshold || 0;

    const idleCallback: IdleCallback = useIdleCallback();

    const toFetch = new Set<string>();
    const fetched = new Set<string>();

    const links = assembleListOfLinks(elements, selectors);

    switch (triggerEvent) {
        case "inView":
            useIntersectionObserver(
                links,
                toFetch,
                fetched,
                idleCallback,
                delayMilliseconds,
                inViewThreshold,
                ignore,
            );
            break;
        case "onHoverOrFocus":
            useEventListener(
                links,
                toFetch,
                fetched,
                idleCallback,
                triggerEvent,
                ignore,
            );
            break;
    }
}

function useEventListener(
    elements: HTMLAnchorElement[],
    toFetch: Set<string>,
    fetched: Set<string>,
    idleCallback: IdleCallback,
    triggerEvent: TriggerEvent,
    ignore: string[],
) {
    const HOVER_FOCUS_EVENTS: (keyof HTMLElementEventMap)[] = [
        "mouseover",
        "focus",
    ];

    let events: (keyof HTMLElementEventMap)[] = [];

    switch (triggerEvent) {
        case "onHoverOrFocus":
            events = HOVER_FOCUS_EVENTS;
    }

    elements.forEach((element) => {
        if (!shouldIgnore(new URL(element.href), ignore)) {
            events.forEach((event) =>
                element.addEventListener(event, (event) => {
                    const link = event.currentTarget as HTMLAnchorElement;

                    if (!fetched.has(link.href)) {
                        toFetch.add(link.href);
                        idleCallback(() => {
                            prefetch(toFetch);
                        });

                        fetched.add(link.href);
                    }
                }),
            );
        }
    });
}

function useIntersectionObserver(
    elements: HTMLAnchorElement[],
    toFetch: Set<string>,
    fetched: Set<string>,
    idleCallback: IdleCallback,
    delayMilliseconds: number,
    inViewThreshold: number,
    ignore: string[],
) {
    const observer = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                const link = entry.target as HTMLAnchorElement;

                // in viewport and not yet prefetched
                if (entry.isIntersecting && !fetched.has(link.href)) {
                    toFetch.add(link.href);

                    // uses setTimeout if delayMilliseconds > 0 or
                    // immediately calls callback
                    useDelay(() => {
                        if (
                            entry.isIntersecting &&
                            toFetch.has(link.href) &&
                            !isSlowConnectionType()
                        ) {
                            idleCallback(() => {
                                prefetch(toFetch);
                            });

                            fetched.add(link.href);
                            observer.unobserve(entry.target);
                        }
                    }, delayMilliseconds);

                    // no longer in viewport
                } else {
                    toFetch.delete(link.href);
                }
            });
        },
        { threshold: inViewThreshold },
    );

    elements.forEach((element) => {
        if (!shouldIgnore(new URL(element.href), ignore)) {
            observer.observe(element);
        }
    });
}

function shouldIgnore(url: URL, ignoreList: string[]): boolean {
    if (location.hostname != url.hostname) {
        return true;
    }

    if (ignoreList.includes(url.href)) {
        return true;
    }

    // can't return from inside a forEach loop
    let shouldIgnore = false;
    ignoreList.forEach((entry) => {
        if (url.href.includes(entry)) {
            shouldIgnore = true;
        }
    });

    return shouldIgnore;
}

function isNodeAnchorElement(node: Node): boolean {
    return node.nodeType === 1 && node.nodeName === "A";
}

function assembleListOfLinks(
    elements?: HTMLAnchorElement | NodeList,
    selectors?: string[],
): HTMLAnchorElement[] {
    const links: HTMLAnchorElement[] = [];

    if (elements) {
        if ("length" in elements) {
            elements.forEach((ele) => {
                if (isNodeAnchorElement(ele)) {
                    links.push(ele as HTMLAnchorElement);
                }
            });
        } else if (isNodeAnchorElement(elements)) {
            links.push(elements);
        }
    }

    selectors?.forEach((selector) => {
        const nodes = document.querySelectorAll(selector);
        nodes.forEach((node) => {
            if (isNodeAnchorElement(node)) {
                links.push(node as HTMLAnchorElement);
            }
        });
    });

    if (!elements && !selectors) {
        const anchorTags = document.querySelectorAll("a");
        anchorTags.forEach((tag) => links.push(tag));
    }
    return links;
}

// Alternative for when requestIdleCallabck is not available in browser, found @ below:
// https://developer.chrome.com/blog/using-requestidlecallback#checking_for_requestidlecallback
function useIdleCallback() {
    return (
        window.requestIdleCallback ||
        function (callback) {
            const start = Date.now();
            return setTimeout(() => {
                callback({
                    didTimeout: false,
                    timeRemaining() {
                        return Math.max(0, 50 - (Date.now() - start));
                    },
                });
            }, 1);
        }
    );
}

function useDelay(callback: () => void, delayMilliseconds: number): void {
    if (delayMilliseconds === 0) {
        callback();
        return;
    }

    setTimeout(callback, delayMilliseconds);
}
