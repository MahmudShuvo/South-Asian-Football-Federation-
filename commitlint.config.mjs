/**
 * Conventional Commits. Enforced because the commit log is the only history that
 * survives, and "fix stuff" tells a future reader nothing. Also lets us generate
 * a changelog automatically later without retroactive archaeology.
 */
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-enum": [
      2,
      "always",
      [
        "web",
        "db",
        "ai",
        "types",
        "config",
        "ci",
        "docs",
        "deps",
        "teams",
        "players",
        "matches",
        "predictions",
        "rankings",
        "admin",
        "fantasy",
      ],
    ],
    "subject-case": [2, "never", ["upper-case", "pascal-case", "start-case"]],
    "body-max-line-length": [1, "always", 100],
  },
};
