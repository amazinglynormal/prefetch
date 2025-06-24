// NetworkInformation API not currently included
// in typescript DOM types
type EffectiveConnectionType = "slow-2g" | "2g" | "3g" | "4g";
type ConnectionType =
    | "bluetooth"
    | "cellular"
    | "ethernet"
    | "none"
    | "wifi"
    | "wimax"
    | "other"
    | "unknown";

interface NetworkInformation extends EventTarget {
    readonly downlink: number;
    readonly downlinkMax: number;
    readonly effectiveType: EffectiveConnectionType;
    readonly rtt: number;
    readonly saveData: boolean;
    readonly type: ConnectionType;
}

function isSaveDataEnabled(): boolean {
    if ("connection" in window.navigator) {
        const connection = window.navigator.connection as NetworkInformation;
        return connection.saveData;
    }

    return false;
}

function isSlowConnectionType(): boolean {
    if ("connection" in window.navigator) {
        const connection = window.navigator.connection as NetworkInformation;
        return (
            connection.effectiveType === "slow-2g" ||
            connection.effectiveType === "2g"
        );
    }
    return false;
}

function shouldIgnore(url: URL, ignoreList: string[]): boolean {
    if (location.hostname != url.hostname) {
        return true;
    }

    if (ignoreList.includes(url.href)) {
        return true;
    }

    // can't return from inside a forEach
    let shouldIgnore = false;
    ignoreList.forEach((entry) => {
        if (url.href.includes(entry)) {
            shouldIgnore = true;
        }
    });

    return shouldIgnore;
}

function supportsSpecRulesAPI(): boolean {
    return (
        HTMLScriptElement.supports &&
        HTMLScriptElement.supports("speculationrules")
    );
}

function appendSpecRuleToDOM(hrefs: Set<string>): void {
    const specScript = document.createElement("script");
    specScript.type = "speculationrules";
    const specRules = {
        prefetch: [
            {
                source: "list",
                urls: [...hrefs],
            },
        ],
    };

    specScript.textContent = JSON.stringify(specRules);
    document.body.append(specScript);
}

function supportsPrefetchResourceHint() {
    const link = document.createElement("link");
    return (
        link.relList &&
        link.relList.supports &&
        link.relList.supports("prefetch")
    );
}

function appendPrefetchResourceHintToDOM(hrefs: Set<string>): void {
    hrefs.forEach((href) => {
        const link = document.createElement("link");
        link.href = href;
        link.rel = "prefetch";

        document.head.appendChild(link);
    });
}

function prefetchUsingFetchAPI(hrefs: Set<string>) {
    hrefs.forEach((href) => {
        const options: RequestInit = {
            priority: "low",
            headers: {
                Purpose: "prefetch",
            },
        };

        fetch(href, options);
    });
}

function prefetch(toFetch: Set<string>): void {
    if (supportsSpecRulesAPI()) {
        appendSpecRuleToDOM(toFetch);
    } else if (supportsPrefetchResourceHint()) {
        appendPrefetchResourceHintToDOM(toFetch);
    } else {
        prefetchUsingFetchAPI(toFetch);
    }
    toFetch.clear();
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
        } else {
            if (isNodeAnchorElement(elements)) {
                links.push(elements);
            }
        }
    }
    if (selectors) {
        selectors.forEach((selector) => {
            const nodes = document.querySelectorAll(selector);
            nodes.forEach((node) => {
                if (isNodeAnchorElement(node)) {
                    links.push(node as HTMLAnchorElement);
                }
            });
        });
    }
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

interface Options {
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
    const elements = options?.elements;
    const selectors = options?.selectors;
    const ignore = options?.ignore || [];
    const delayMilliseconds = options?.delayMilliseconds || 0;
    const inViewThreshold = options?.inViewThreshold || 0;
    const idleCallback = useIdleCallback();

    const toFetch = new Set<string>();
    const fetched = new Set<string>();

    const observer = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                const link = entry.target as HTMLAnchorElement;
                if (entry.isIntersecting) {
                    if (!fetched.has(link.href)) {
                        if (delayMilliseconds > 0) {
                            toFetch.add(link.href);
                            setTimeout(() => {
                                if (
                                    entry.isIntersecting &&
                                    toFetch.has(link.href)
                                ) {
                                    idleCallback(() => {
                                        prefetch(toFetch);
                                    });
                                    fetched.add(link.href);
                                    observer.unobserve(entry.target);
                                }
                            }, delayMilliseconds);
                        } else {
                            if (!isSlowConnectionType()) {
                                toFetch.add(link.href);
                                idleCallback(() => {
                                    prefetch(toFetch);
                                });
                                fetched.add(link.href);
                                observer.unobserve(entry.target);
                            }
                        }
                    }
                } else {
                    toFetch.delete(link.href);
                }
            });
        },
        { threshold: inViewThreshold },
    );

    const links = assembleListOfLinks(elements, selectors);

    links.forEach((link) => {
        if (!shouldIgnore(new URL(link.href), ignore)) {
            observer.observe(link);
        }
    });
}
