/**
 * Public surface of @saff/shared-types.
 *
 * Only types that genuinely cross an app boundary belong here — web to mobile,
 * or the TypeScript side to the Python AI pipeline's JSON contract. Module-internal
 * types stay inside their module's `domain` layer.
 *
 * Real entity types arrive on Day 3 alongside the Prisma schema.
 */

export * from "./primitives";
