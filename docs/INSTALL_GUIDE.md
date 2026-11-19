# HIMATKN Root Kit — Installation Notes

This ZIP is structured so its contents can be placed at the root of the local HIMATKN repository.

## Before extraction

1. Check `git status --short` in the local repository.
2. Check whether `docs/AGENTS.md`, `docs/progress.md`, `docs/OPEN_CODE_FIRST_PROMPT.md`, or `Design/` already exists. Do not overwrite user files blindly; compare/merge first.
3. Extract the design prototype to the repository root. The expected reference path is `Design/` (Prototype Desain HIMATKN V1: HTML, `assets/style.css`, `assets/app.js`, `assets/img/`). The old reference folders `HIMATKN_Public_Design_Reference/` and `HIMATKN_Admin_Panel_Design_Reference/` are deprecated and must not be used.
4. Read `docs/AGENTS.md` (start at its "Mulai di sini" section) and `docs/progress.md` (start at Current Project State), open OpenCode from the repo root, then submit `docs/OPEN_CODE_FIRST_PROMPT.md`.

This kit does not modify the GitHub repository or production deployment. It contains the design prototype and local work instructions only.
