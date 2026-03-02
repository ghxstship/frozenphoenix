/* ═══════════════════════════════════════════════════════════════
   L-003: Lazy Demo Data Loader
   ═══════════════════════════════════════════════════════════════
   
   Provides lazy-loading wrappers for demo data modules to reduce
   initial bundle size. Each loader returns a promise that resolves
   to the module's exports on first access and caches thereafter.
   
   Usage:
     const { demoTasks } = await loadDemoData();
     const { demoActivations } = await loadDemoProduction();
   ═══════════════════════════════════════════════════════════════ */

type LazyModule<T> = () => Promise<T>;

function createLazyLoader<T>(loader: LazyModule<T>): LazyModule<T> {
    let cached: T | null = null;
    return async () => {
        if (cached) return cached;
        cached = await loader();
        return cached;
    };
}

export const loadDemoData = createLazyLoader(() => import("./demo-data"));
export const loadDemoProduction = createLazyLoader(() => import("./demo-data-production"));
export const loadDemoCRM = createLazyLoader(() => import("./demo-data-crm-revenue"));
export const loadDemoCreativeBrand = createLazyLoader(() => import("./demo-data-creative-brand"));
export const loadDemoGovernance = createLazyLoader(() => import("./demo-data-governance"));
export const loadDemoUserLifecycle = createLazyLoader(() => import("./demo-data-user-lifecycle"));
export const loadDemoVendorLifecycle = createLazyLoader(
    () => import("./demo-data-vendor-lifecycle")
);
export const loadDemoWorkforce = createLazyLoader(() => import("./demo-data-workforce"));
