# titah-extensions

The curated index that Titah's extension picker reads.

An extension is an npm package that contributes a **side panel** to Titah's TUI —
a git branch list, a diff view, a scratchpad. See
[`docs/extensions.md`](https://github.com/titah-dev/titah/blob/main/docs/extensions.md)
in the main repo for how to write one.

## Why this is a separate repo

A pull request that says "add my extension" should not run Titah's CI, touch its
release cycle, or give external contributors a review surface on the core repo.
The index lives here so that adding an entry is a small, obvious change with a
small, obvious review.

## Adding your extension

1. Publish your package to npm.
2. Open a pull request adding one entry to `registry.json`.
3. CI validates the shape. A maintainer reviews the package itself.

```jsonc
{
  "id": "git",                          // lowercase, dashes; how `market:<id>` finds it
  "package": "@titah/extension-git",    // the npm package name
  "version": "0.1.0",                   // EXACT version, never a range
  "title": "Git",
  "description": "Current branch, local branches, worktrees, and changed files",
  "homepage": "https://github.com/titah-dev/titah-extension-git"
}
```

### Why `version` is exact and not a range

`market:git` on two machines has to mean the same code. A registry that answers
"whatever is newest" cannot give that guarantee, and the failure it produces is
the worst kind: a panel that works on your laptop and breaks on the server, with
nothing in either config to explain the difference.

Publishing a new version of your extension means opening a PR to bump the entry.
That is deliberate friction: it is the only point at which anyone reviews what
changed before it reaches other people's machines.

## What review covers, and what it does not

A maintainer checks that the package exists, that it declares `engines.titah`
and `titah.panel`, that it loads, and that it does roughly what it says.

**Review is not a security audit.** Extensions run inside the Titah process with
no sandbox — they can read any file Titah can read and reach the network. Being
listed here is not an endorsement, and installing one is the same trust decision
as `npm install`. Titah asks before it downloads anything for exactly this
reason.

## Being removed

An entry is removed if the package is unpublished, stops loading against
supported Titah versions, or turns out to do something it did not say it did.
Removal drops it from the picker; it does not uninstall it from anyone's machine.
