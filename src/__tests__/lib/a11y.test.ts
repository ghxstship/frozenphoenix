/* ═══════════════════════════════════════════════════════════════
   M-012: Accessibility (axe-core) Test Suite
   ═══════════════════════════════════════════════════════════════
   
   Validates key UI primitives against WCAG 2.2 AA using vitest-axe.
   Run: npm test -- src/__tests__/lib/a11y.test.ts
   ═══════════════════════════════════════════════════════════════ */

import { afterEach, describe, expect, it } from "vitest";
import { axe } from "vitest-axe";
import "vitest-axe/extend-expect";

let activeContainer: HTMLDivElement | null = null;

function createContainer(html: string): HTMLDivElement {
    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.appendChild(container);
    activeContainer = container;
    return container;
}

afterEach(() => {
    if (activeContainer && activeContainer.parentNode) {
        activeContainer.parentNode.removeChild(activeContainer);
    }
    activeContainer = null;
});

describe("Accessibility: axe-core smoke tests", () => {
    it("button with label passes", async () => {
        const container = createContainer('<button type="button">Save</button>');
        const results = await axe(container);
        expect(results.violations).toHaveLength(0);
    });

    it("image without alt fails", async () => {
        const container = createContainer('<img src="/test.png" />');
        const results = await axe(container);
        expect(results.violations.length).toBeGreaterThan(0);
    });

    it("form input with label passes", async () => {
        const container = createContainer(`
            <form>
                <label for="email">Email</label>
                <input id="email" type="email" name="email" />
            </form>
        `);
        const results = await axe(container);
        expect(results.violations).toHaveLength(0);
    });

    it("form input without label fails", async () => {
        const container = createContainer(`
            <form>
                <input type="email" name="email" />
            </form>
        `);
        const results = await axe(container);
        expect(results.violations.length).toBeGreaterThan(0);
    });

    it("table with caption passes", async () => {
        const container = createContainer(`
            <table>
                <caption>Data table</caption>
                <thead><tr><th>Name</th><th>Value</th></tr></thead>
                <tbody><tr><td>A</td><td>1</td></tr></tbody>
            </table>
        `);
        const results = await axe(container);
        expect(results.violations).toHaveLength(0);
    });

    it("nav with aria-label passes", async () => {
        const container = createContainer(`
            <nav aria-label="Main navigation">
                <ul><li><a href="/dashboard">Dashboard</a></li></ul>
            </nav>
        `);
        const results = await axe(container);
        expect(results.violations).toHaveLength(0);
    });

    it("dialog with role and label passes", async () => {
        const container = createContainer(`
            <div role="dialog" aria-label="Confirm action" aria-modal="true">
                <p>Are you sure?</p>
                <button type="button">Yes</button>
                <button type="button">No</button>
            </div>
        `);
        const results = await axe(container);
        expect(results.violations).toHaveLength(0);
    });

    it("heading hierarchy is correct", async () => {
        const container = createContainer(`
            <main>
                <h1>Page Title</h1>
                <section>
                    <h2>Section</h2>
                    <h3>Subsection</h3>
                </section>
            </main>
        `);
        const results = await axe(container);
        expect(results.violations).toHaveLength(0);
    });
});
