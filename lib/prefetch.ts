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

export function prefetch(toFetch: Set<string>): void {
    if (supportsSpecRulesAPI()) {
        appendSpecRuleToDOM(toFetch);
    } else if (supportsPrefetchResourceHint()) {
        appendPrefetchResourceHintToDOM(toFetch);
    } else {
        prefetchUsingFetchAPI(toFetch);
    }
    toFetch.clear();
}
