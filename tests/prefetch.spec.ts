import { test, expect, chromium, firefox, webkit } from "@playwright/test";

const server = "/tests/pages/";

const URL_ONE = "/tests/pages/page1";
const URL_TWO = "/tests/pages/page2";
const URL_THREE = "/tests/pages/page3";

const EXPECTED_URLS = [URL_ONE, URL_TWO, URL_THREE];

test("basic default usage works correctly (umd)", async ({ page }) => {
    const prefetchPromises = EXPECTED_URLS.map((url) =>
        page.waitForRequest((req) => req.url().includes(url)),
    );

    const prefetched: string[] = [];
    page.on("request", (req) => {
        if (req.url().includes("pages/page")) {
            // remove http://localhost:5173
            const url = req.url().slice(21);
            prefetched.push(url);
        }
    });

    await page.goto(`${server}test-basic-default-umd.html`);

    await expect(page).toHaveTitle(/Prefetch Test Page/);

    const link = page.getByRole("link", { name: "go to page 1" });
    const link2 = page.getByRole("link", { name: "go to page 2" });
    const link3 = page.getByRole("link", { name: "go to page 3" });

    await expect(link).toBeInViewport();

    await link2.focus();
    await expect(link2).toBeInViewport();

    await link3.focus();
    await expect(link3).toBeInViewport();

    await Promise.all(prefetchPromises);

    expect(prefetched).toContainEqual(URL_ONE);
    expect(prefetched).toContainEqual(URL_TWO);
    expect(prefetched).toContainEqual(URL_THREE);
});

test("basic default usage works correctly (esm)", async ({ page }) => {
    const prefetchPromises = EXPECTED_URLS.map((url) =>
        page.waitForRequest((req) => req.url().includes(url)),
    );

    const prefetched: string[] = [];
    page.on("request", (req) => {
        if (req.url().includes("pages/page")) {
            // remove http://localhost:5173
            const url = req.url().slice(21);
            prefetched.push(url);
        }
    });

    await page.goto(`${server}test-basic-default-esm.html`);

    await expect(page).toHaveTitle(/Prefetch Test Page/);

    const link = page.getByRole("link", { name: "go to page 1" });
    const link2 = page.getByRole("link", { name: "go to page 2" });
    const link3 = page.getByRole("link", { name: "go to page 3" });

    await expect(link).toBeInViewport();

    await link2.focus();
    await expect(link2).toBeInViewport();

    await link3.focus();
    await expect(link3).toBeInViewport();

    await Promise.all(prefetchPromises);

    expect(prefetched).toContainEqual(URL_ONE);
    expect(prefetched).toContainEqual(URL_TWO);
    expect(prefetched).toContainEqual(URL_THREE);
});

test("ignores hrefs in option.ignore", async ({ page }) => {
    const prefetchPromise = page.waitForRequest((req) =>
        req.url().includes(URL_THREE),
    );

    const prefetched: string[] = [];
    page.on("request", (req) => {
        if (req.url().includes("pages/page")) {
            // remove http://localhost:5173
            const url = req.url().slice(21);
            prefetched.push(url);
        }
    });

    await page.goto(`${server}test-with-ignore-array.html`);

    await expect(page).toHaveTitle(/Prefetch Test Page/);

    const link = page.getByRole("link", { name: "go to page 1" });
    const link2 = page.getByRole("link", { name: "go to page 2" });
    const link3 = page.getByRole("link", { name: "go to page 3" });

    await expect(link).toBeInViewport();

    await link2.focus();
    await expect(link2).toBeInViewport();

    await link3.focus();
    await expect(link3).toBeInViewport();

    await prefetchPromise;

    expect(prefetched.length).toBe(1);
    expect(prefetched).toContainEqual(URL_THREE);
});

test("passing option.selectors overrides default links watched (single)", async ({
    page,
}) => {
    const prefetchPromise = page.waitForRequest((req) =>
        req.url().includes(URL_TWO),
    );

    const prefetched: string[] = [];
    page.on("request", (req) => {
        if (req.url().includes("pages/page")) {
            // remove http://localhost:5173
            const url = req.url().slice(21);
            prefetched.push(url);
        }
    });

    await page.goto(`${server}test-with-selectors-array-single.html`);

    await expect(page).toHaveTitle(/Prefetch Test Page/);

    const link = page.getByRole("link", { name: "go to page 1" });
    const link2 = page.getByRole("link", { name: "go to page 2" });
    const link3 = page.getByRole("link", { name: "go to page 3" });

    await expect(link).toBeInViewport();

    await link2.focus();
    await expect(link2).toBeInViewport();

    await link3.focus();
    await expect(link3).toBeInViewport();

    await prefetchPromise;

    expect(prefetched.length).toBe(1);
    expect(prefetched).toContainEqual(URL_TWO);
});

test("passing option.selectors overrides default links watched (mutliple)", async ({
    page,
}) => {
    const prefetchPromises = [URL_TWO, URL_THREE].map((url) =>
        page.waitForRequest((req) => req.url().includes(url)),
    );

    const prefetched: string[] = [];
    page.on("request", (req) => {
        if (req.url().includes("pages/page")) {
            // remove http://localhost:5173
            const url = req.url().slice(21);
            prefetched.push(url);
        }
    });

    await page.goto(`${server}test-with-selectors-array-multiple.html`);

    await expect(page).toHaveTitle(/Prefetch Test Page/);

    const link = page.getByRole("link", { name: "go to page 1" });
    const link2 = page.getByRole("link", { name: "go to page 2" });
    const link3 = page.getByRole("link", { name: "go to page 3" });

    await expect(link).toBeInViewport();

    await link2.focus();
    await expect(link2).toBeInViewport();

    await link3.focus();
    await expect(link3).toBeInViewport();

    await Promise.all(prefetchPromises);

    expect(prefetched.length).toBe(2);
    expect(prefetched).toContainEqual(URL_TWO);
    expect(prefetched).toContainEqual(URL_THREE);
});

test("passing option.elements overrides default links watched (single)", async ({
    page,
}) => {
    const prefetchPromise = page.waitForRequest((req) =>
        req.url().includes(URL_TWO),
    );

    const prefetched: string[] = [];
    page.on("request", (req) => {
        if (req.url().includes("pages/page")) {
            // remove http://localhost:5173
            const url = req.url().slice(21);
            prefetched.push(url);
        }
    });

    await page.goto(`${server}test-with-elements-array-single.html`);

    await expect(page).toHaveTitle(/Prefetch Test Page/);

    const link = page.getByRole("link", { name: "go to page 1" });
    const link2 = page.getByRole("link", { name: "go to page 2" });
    const link3 = page.getByRole("link", { name: "go to page 3" });

    await expect(link).toBeInViewport();

    await link2.focus();
    await expect(link2).toBeInViewport();

    await link3.focus();
    await expect(link3).toBeInViewport();

    await prefetchPromise;

    expect(prefetched.length).toBe(1);
    expect(prefetched).toContainEqual(URL_TWO);
});

test("passing option.elements overrides default links watched (mutliple)", async ({
    page,
}) => {
    const prefetchPromises = [URL_TWO, URL_THREE].map((url) =>
        page.waitForRequest((req) => req.url().includes(url)),
    );

    const prefetched: string[] = [];
    page.on("request", (req) => {
        if (req.url().includes("pages/page")) {
            // remove http://localhost:5173
            const url = req.url().slice(21);
            prefetched.push(url);
        }
    });

    await page.goto(`${server}test-with-elements-array-multiple.html`);

    await expect(page).toHaveTitle(/Prefetch Test Page/);

    const link = page.getByRole("link", { name: "go to page 1" });
    const link2 = page.getByRole("link", { name: "go to page 2" });
    const link3 = page.getByRole("link", { name: "go to page 3" });

    await expect(link).toBeInViewport();

    await link2.focus();
    await expect(link2).toBeInViewport();

    await link3.focus();
    await expect(link3).toBeInViewport();

    await Promise.all(prefetchPromises);

    expect(prefetched.length).toBe(2);
    expect(prefetched).toContainEqual(URL_TWO);
    expect(prefetched).toContainEqual(URL_THREE);
});

test("option.elements and option.selector can both be used", async ({
    page,
}) => {
    const prefetchPromises = [URL_TWO, URL_THREE].map((url) =>
        page.waitForRequest((req) => req.url().includes(url)),
    );

    const prefetched: string[] = [];
    page.on("request", (req) => {
        if (req.url().includes("pages/page")) {
            // remove http://localhost:5173
            const url = req.url().slice(21);
            prefetched.push(url);
        }
    });

    await page.goto(`${server}test-with-elements-and-selectors-arrays.html`);

    await expect(page).toHaveTitle(/Prefetch Test Page/);

    const link = page.getByRole("link", { name: "go to page 1" });
    const link2 = page.getByRole("link", { name: "go to page 2" });
    const link3 = page.getByRole("link", { name: "go to page 3" });

    await expect(link).toBeInViewport();

    await link2.focus();
    await expect(link2).toBeInViewport();

    await link3.focus();
    await expect(link3).toBeInViewport();

    await Promise.all(prefetchPromises);

    expect(prefetched.length).toBe(2);
    expect(prefetched).toContainEqual(URL_TWO);
    expect(prefetched).toContainEqual(URL_THREE);
});

test("passing duplicates in option.elements and option.selector does not make duplicate requests", async ({
    page,
}) => {
    const prefetchPromises = [URL_TWO, URL_THREE].map((url) =>
        page.waitForRequest((req) => req.url().includes(url)),
    );

    const prefetched: string[] = [];
    page.on("request", (req) => {
        if (req.url().includes("pages/page")) {
            // remove http://localhost:5173
            const url = req.url().slice(21);
            prefetched.push(url);
        }
    });

    await page.goto(
        `${server}test-with-duplicates-in-elements-and-selectors-arrays.html`,
    );

    await expect(page).toHaveTitle(/Prefetch Test Page/);

    const link = page.getByRole("link", { name: "go to page 1" });
    const link2 = page.getByRole("link", { name: "go to page 2" });
    const link3 = page.getByRole("link", { name: "go to page 3" });

    await expect(link).toBeInViewport();

    await link2.focus();
    await expect(link2).toBeInViewport();

    await link3.focus();
    await expect(link3).toBeInViewport();

    await Promise.all(prefetchPromises);

    expect(prefetched.length).toBe(2);
    expect(prefetched).toContainEqual(URL_TWO);
    expect(prefetched).toContainEqual(URL_THREE);
});

test("does not trigger prefetch until element in viewport for options.delayMilliseconds", async ({
    page,
}) => {
    const prefetchPromises = [URL_ONE, URL_THREE].map((url) =>
        page.waitForRequest((req) => req.url().includes(url)),
    );

    const prefetched: string[] = [];
    page.on("request", (req) => {
        if (req.url().includes("pages/page")) {
            // remove http://localhost:5173
            const url = req.url().slice(21);
            prefetched.push(url);
        }
    });

    await page.goto(`${server}test-with-delay-option.html#section-3`);

    await expect(page).toHaveTitle(/Prefetch Test Page/);

    const link = page.getByRole("link", { name: "go to page 1" });
    const link3 = page.getByRole("link", { name: "go to page 3" });

    // option.delayMilliseconds === 1500ms
    await link3.focus();
    await page.waitForTimeout(1600);

    await link.focus();
    await page.waitForTimeout(1600);

    await Promise.all(prefetchPromises);

    expect(prefetched.length).toBe(2);
    expect(prefetched).toContainEqual(URL_THREE);
    expect(prefetched).toContainEqual(URL_ONE);
});

test("does not prefetch until options.threshold is satisfied", async ({
    page,
}) => {
    const prefetchPromises = [URL_ONE, URL_TWO].map((url) =>
        page.waitForRequest((req) => req.url().includes(url)),
    );

    const prefetched: string[] = [];
    page.on("request", (req) => {
        if (req.url().includes("pages/page")) {
            // remove http://localhost:5173
            const url = req.url().slice(21);
            prefetched.push(url);
        }
    });

    await page.goto(`${server}test-with-threshold-option.html`);

    await expect(page).toHaveTitle(/Prefetch Test Page/);

    // option.inViewThreshold === 0.75
    const link = page.getByRole("link", { name: "go to page 1" });
    const link2 = page.getByRole("link", { name: "go to page 2" });

    await expect(link).toBeInViewport();

    await page.evaluate(() => window.scrollBy(0, 800));

    await expect(link2).toBeInViewport();

    await page.evaluate(() => window.scrollBy(0, 500));

    await Promise.all(prefetchPromises);

    expect(prefetched.length).toBe(2);
    expect(prefetched).toContainEqual(URL_ONE);
    expect(prefetched).toContainEqual(URL_TWO);
});

test("prefetch request is triggered by hover on element (desktop)", async ({
    page,
}) => {
    const prefetchPromises = [URL_ONE, URL_THREE].map((url) =>
        page.waitForRequest((req) => req.url().includes(url)),
    );

    const prefetched: string[] = [];
    page.on("request", (req) => {
        if (req.url().includes("pages/page")) {
            // remove http://localhost:5173
            const url = req.url().slice(21);
            prefetched.push(url);
        }
    });

    await page.goto(`${server}test-with-on-hover-or-focus.html`);

    await expect(page).toHaveTitle(/Prefetch Test Page/);

    const link = page.getByRole("link", { name: "go to page 1" });
    const link2 = page.getByRole("link", { name: "go to page 2" });
    const link3 = page.getByRole("link", { name: "go to page 3" });

    await expect(link).toBeInViewport();
    await link.hover();

    await link2.scrollIntoViewIfNeeded();
    await expect(link2).toBeInViewport();

    await link3.hover();
    await expect(link3).toBeInViewport();

    await Promise.all(prefetchPromises);

    expect(prefetched.length).toBe(2);
    expect(prefetched).toContainEqual(URL_ONE);
    expect(prefetched).toContainEqual(URL_THREE);
});

test("prefetch is triggered by focusing element (desktop)", async ({
    page,
}) => {
    const prefetchPromises = [URL_ONE, URL_THREE].map((url) =>
        page.waitForRequest((req) => req.url().includes(url)),
    );

    const prefetched: string[] = [];
    page.on("request", (req) => {
        if (req.url().includes("pages/page")) {
            // remove http://localhost:5173
            const url = req.url().slice(21);
            prefetched.push(url);
        }
    });

    await page.goto(`${server}test-with-on-hover-or-focus.html`);

    await expect(page).toHaveTitle(/Prefetch Test Page/);

    const link = page.getByRole("link", { name: "go to page 1" });
    const link2 = page.getByRole("link", { name: "go to page 2" });
    const link3 = page.getByRole("link", { name: "go to page 3" });

    await expect(link).toBeInViewport();
    await link.hover();

    await link2.scrollIntoViewIfNeeded();
    await expect(link2).toBeInViewport();

    await link3.hover();
    await expect(link3).toBeInViewport();

    await Promise.all(prefetchPromises);

    expect(prefetched.length).toBe(2);
    expect(prefetched).toContainEqual(URL_ONE);
    expect(prefetched).toContainEqual(URL_THREE);
});
