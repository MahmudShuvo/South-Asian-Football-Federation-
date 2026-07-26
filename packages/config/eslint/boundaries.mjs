import boundaries from "eslint-plugin-boundaries";

/**
 * Architecture enforcement for the modular monolith (ADR-001).
 *
 * docs/01-architecture-day1.md section 6.3 layers every module as:
 *
 *     presentation   -> React components, hooks        (knows JSX)
 *     application    -> use cases, orchestration       (knows the workflow)
 *     domain         -> entities, rules, value types   (knows nothing external)
 *     infrastructure -> Prisma, HTTP, cache, storage   (knows the outside world)
 *
 * Two invariants make that real rather than aspirational:
 *
 *   1. Dependencies point INWARD only. Domain never imports infrastructure.
 *   2. Modules are opaque to each other. Module A may not reach into module B's
 *      domain or infrastructure; it goes through B's `application` layer.
 *
 * Invariant 2 is what preserves our ability to extract a module into its own
 * service later. Without it the monolith quietly becomes a tangle and "modular"
 * is just a word in a document nobody reads.
 *
 * Written against eslint-plugin-boundaries v7 (`policies` + object selectors).
 */
export default [
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { boundaries },
    settings: {
      /* Without a TypeScript-aware resolver, boundaries cannot follow `@/` path
         aliases or extensionless imports. It then classifies every target as
         "unknown", which produces the right failure for the wrong reason — and
         would misfire on legitimate imports. */
      "import/resolver": {
        typescript: { alwaysTryTypes: true, project: "./tsconfig.json" },
      },
      "boundaries/include": ["src/**/*"],
      "boundaries/elements": [
        /* Element descriptors classify FOLDERS, not files: every file inside the
           matched folder belongs to that element. `capture` extracts the module
           name so a policy can distinguish "same module" from "any other module".

           Order matters — the first matching descriptor wins, so the most
           specific patterns are listed first. */
        { type: "domain", pattern: "src/modules/*/domain", capture: ["module"] },
        { type: "application", pattern: "src/modules/*/application", capture: ["module"] },
        { type: "infrastructure", pattern: "src/modules/*/infrastructure", capture: ["module"] },
        { type: "presentation", pattern: "src/modules/*/presentation", capture: ["module"] },
        { type: "app", pattern: "src/app" },

        /* Design-system primitives, hooks, styles and cross-cutting helpers,
           including the validated env module. Anything here must be safe for any
           layer to import, which is exactly what the `shared` policy enforces. */
        { type: "shared", pattern: "src/{lib,components,hooks,styles}" },
      ],
    },
    rules: {
      "boundaries/dependencies": [
        "error",
        {
          default: "disallow",
          policies: [
            /* DOMAIN — the innermost layer. Imports nothing but its own module's
               domain. This purity is what lets business rules be unit tested
               without a database, and reused unchanged by the Python pipeline. */
            {
              from: { element: { type: "domain" } },
              allow: {
                to: {
                  element: {
                    type: "domain",
                    captured: { module: "{{ from.element.captured.module }}" },
                  },
                },
              },
              message:
                "domain must stay pure — it may only import its own module's domain. Anything touching Prisma, HTTP or React belongs in infrastructure or application.",
            },

            /* APPLICATION — orchestrates. Reaches its own domain and
               infrastructure plus shared utilities. Cross-module access is
               permitted ONLY to another module's application layer: the single
               sanctioned seam between modules. */
            {
              from: { element: { type: "application" } },
              allow: {
                to: [
                  {
                    element: {
                      type: ["domain", "infrastructure"],
                      captured: { module: "{{ from.element.captured.module }}" },
                    },
                  },
                  { element: { type: ["application", "shared"] } },
                ],
              },
            },

            /* INFRASTRUCTURE — implements ports the domain defines. May read its
               own domain types; must not orchestrate use cases. */
            {
              from: { element: { type: "infrastructure" } },
              allow: {
                to: [
                  {
                    element: {
                      type: "domain",
                      captured: { module: "{{ from.element.captured.module }}" },
                    },
                  },
                  { element: { type: "shared" } },
                ],
              },
            },

            /* PRESENTATION — renders. Calls its own application layer, and may
               compose other modules' presentation components (a match page
               legitimately renders a PlayerCard). */
            {
              from: { element: { type: "presentation" } },
              allow: {
                to: [
                  {
                    element: {
                      type: ["domain", "application"],
                      captured: { module: "{{ from.element.captured.module }}" },
                    },
                  },
                  { element: { type: ["presentation", "shared"] } },
                ],
              },
            },

            /* APP (routing) — the composition root. Its job is wiring modules
               together, so it may reach presentation and application anywhere.
               It must NOT reach domain or infrastructure directly. */
            {
              from: { element: { type: "app" } },
              allow: {
                to: { element: { type: ["app", "presentation", "application", "shared"] } },
              },
            },

            /* SHARED — generic utilities and design-system primitives. Must not
               depend on any feature module, or it stops being shared. */
            {
              from: { element: { type: "shared" } },
              allow: { to: { element: { type: "shared" } } },
              message:
                "shared code must not depend on a feature module. If it needs module knowledge, it belongs inside that module.",
            },
          ],
        },
      ],

      /* A local import whose target matches no element descriptor means someone
         invented a folder without deciding where it sits in the architecture.
         Catch that on Day 2, not Day 200. */
      "boundaries/no-unknown-dependencies": "error",
      "boundaries/no-unknown-files": "error",
    },
  },

  /* Tests may reach wherever they need to. */
  {
    files: ["src/**/*.{test,spec}.{ts,tsx}", "src/**/__tests__/**/*"],
    rules: {
      "boundaries/dependencies": "off",
      "boundaries/no-unknown-dependencies": "off",
      "boundaries/no-unknown-files": "off",
    },
  },
];
