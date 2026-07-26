import path from "node:path";

/**
 * Pre-commit checks on staged files only, so the hook stays fast (ADR-021). Full
 * type checking is CI's job — a hook slow enough to be annoying gets bypassed with
 * `--no-verify`, and a bypassed hook enforces nothing.
 *
 * Two non-obvious constraints shape this file.
 *
 * 1. ESLint must run *inside* the workspace package that owns the file. Running it
 *    from the repo root looks like it works — ESLint 10 does find the nearest
 *    `eslint.config.mjs` — but `tsconfigRootDir` and the boundaries element
 *    patterns (`src/modules/<name>/domain`) resolve against the CWD. From the root they
 *    match nothing, so the architecture rules pass silently on violating code.
 *    Silently wrong is worse than failing. See ADR-025.
 *
 * 2. lint-staged passes ABSOLUTE paths, and it runs commands without a shell, so
 *    arguments are split on whitespace. A repository checked out to a path
 *    containing a space (`D:\Saff AI`) therefore breaks every command built by
 *    joining absolute paths. Every path emitted here is relative to the package
 *    the command runs in, which removes the parent directory — and its space —
 *    from the argument entirely. See ADR-027.
 */

/** Packages that have their own eslint.config.mjs. */
const LINTED_WORKSPACES = ["apps/web", "packages/shared-types", "packages/database"];

const repoRoot = process.cwd();

/** Absolute path -> path relative to `from`, with forward slashes. */
function toRelative(absFile, from = repoRoot) {
  return path.relative(from, absFile).split(path.sep).join("/");
}

function groupByWorkspace(files) {
  const groups = new Map();

  for (const absFile of files) {
    const rel = toRelative(absFile);
    const ws = LINTED_WORKSPACES.find((w) => rel.startsWith(`${w}/`));
    if (!ws) continue;

    if (!groups.has(ws)) groups.set(ws, []);
    groups.get(ws).push(rel.slice(ws.length + 1));
  }

  return groups;
}

/**
 * One `pnpm -C <workspace> exec eslint` command per affected package.
 *
 * `--max-warnings=0` applies to source but not to config files: a warning nobody
 * fixes is noise, and noise is how real errors get missed.
 */
function eslintCommands(files, { maxWarningsZero }) {
  const flags = maxWarningsZero ? "--fix --max-warnings=0" : "--fix";

  return [...groupByWorkspace(files).entries()].map(
    ([ws, relFiles]) => `pnpm -C ${ws} exec eslint ${flags} ${relFiles.join(" ")}`,
  );
}

/** Prettier runs from the repo root, so paths are relative to it. */
function prettierCommand(files) {
  return `prettier --write ${files.map((f) => toRelative(f)).join(" ")}`;
}

export default {
  "*.{ts,tsx}": (files) => [
    ...eslintCommands(files, { maxWarningsZero: true }),
    prettierCommand(files),
  ],

  /* Config files. Root-level ones belong to no linted workspace, so they get
     Prettier only — each package's own lint run in CI covers the rest. */
  "*.{js,mjs,cjs}": (files) => [
    ...eslintCommands(files, { maxWarningsZero: false }),
    prettierCommand(files),
  ],

  "*.{json,md,css,yml,yaml}": (files) => [prettierCommand(files)],
};
