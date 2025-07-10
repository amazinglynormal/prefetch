function supportsSpecRulesAPI(): boolean {
    return (
        HTMLScriptElement.supports &&
        HTMLScriptElement.supports("speculationrules")
    );
}

function appendSpecRuleToDOM(
    hrefs: Set<string>,
    action: "prefetch" | "prerender",
): void {
    const specScript = document.createElement("script");
    specScript.type = "speculationrules";

    const list = [{ source: "list", urls: [...hrefs] }];

    const specRules =
        action === "prefetch" ? { prefetch: list } : { prerender: list };

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

export function prefetch(toFetch: Set<string>, prerender: boolean): void {
    if (prerender && supportsSpecRulesAPI()) {
        appendSpecRuleToDOM(toFetch, "prerender");
    } else if (supportsSpecRulesAPI()) {
        appendSpecRuleToDOM(toFetch, "prefetch");
    } else if (supportsPrefetchResourceHint()) {
        appendPrefetchResourceHintToDOM(toFetch);
    } else {
        prefetchUsingFetchAPI(toFetch);
    }
    toFetch.clear();
}
