This repository is a small client-side web app built with Parcel, running in demo mode (no backend).

Quick context for an AI coding agent:

- Language/environment: Vanilla ES modules ("type": "module" in package.json), built with Parcel.
- Entry points: `index.html` (root app), plus feature pages under `src/*/` such as `src/Search_for_pet/index.html` and `src/Register_Pet/Register.html`.
- UI pattern: simple DOM-driven presenters in `src/*/presenter*.js` that wire DOM events to small business-logic modules (e.g. `src/Search_for_pet/search.js`, `src/Register_Pet/register.js`).

What to change and where (common tasks):

- Add small UI features or fix behaviours: update the corresponding `presenter*.js` file in the feature folder (e.g. `src/Search_for_pet/presenterSearch.js`). Keep DOM queries by id/class consistent with the feature HTML.
- Update business logic / pure functions: edit the module under the same feature (e.g. `src/Search_for_pet/search.js` or `src/Register_Pet/register.js`). These modules return simple values or throw errors to indicate outcomes (see examples below).
- Data/auth: Demo-only, persisted in `localStorage` (see `src/services/demo-store.js` and `src/firebase.js`).

Key commands (package.json):

- Install dependencies: `npm install`
- Start dev server (Parcel): `npm start` (serves `index.html` at the default Parcel port; this project typically uses `http://localhost:1234`)
- Run tests: `npm test` (prints a placeholder message; no test suite configured)

Project-specific conventions and patterns:

- Presenters initialize on DOMContentLoaded and wire DOM -> business logic. Example: `src/Register_Pet/presenterRegister.js` collects form values, validates them, calls `register.js`, and uses `displayMessage.js` for user feedback.
- Business logic modules are intentionally minimal and synchronous. In `src/Search_for_pet/search.js` the function returns a string or throws Error objects with messages like `"¡Mascota Encontrada por nombre!"` — callers expect either a return value or an exception to indicate found/not-found outcomes.
- UI helpers: view-specific helper files exist (e.g. `RegisterView.js`) — prefer using these when available to keep presenters thin.

Integration notes and gotchas:

- Session/data are stored in `localStorage`. Clearing it resets the demo.
- Some modules throw Errors to signal business outcomes (see `src/Search_for_pet/search.js`). When modifying these modules, preserve the contract (throw strings/errors with the same messages) or update callers accordingly.

Files you will likely edit for common requests:

- Add/fix search behaviour: `src/Search_for_pet/search.js` and `src/Search_for_pet/presenterSearch.js` (+ `search.html`)
- Add/fix registration: `src/Register_Pet/register.js` and `src/Register_Pet/presenterRegister.js` (+ `Register.html`)
- Demo storage/auth: `src/services/demo-store.js`, `src/firebase.js`, and `src/services/*`.

When in doubt, prefer small, incremental edits and keep DOM IDs/classes consistent between HTML and presenters.
