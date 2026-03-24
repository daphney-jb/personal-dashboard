## Transcript Highlights

### 1. Scaffolding the project from scratch
The first session set up Vite + React, React Router v6, and the full folder
structure — components, pages, hooks, utils — all at once. A sidebar layout
with an `<Outlet>` wrapper meant every future page would inherit navigation
for free. A landing page (`index-landing.html`) and README with the full
feature roadmap were also created, and the app was deployed to Netlify before
a single widget was built.

### 2. Building the core widgets (Weather, Todo, News)
Three independent widgets were built in the same session, each with its own
data layer:

- **Weather** — fetches from Open-Meteo (no API key required), maps WMO
  weather codes to human-readable conditions, and caches the result in
  `nexboard_weather_cache` so refreshing the page doesn't fire a new request
  every time. Falls back to NYC coordinates when the browser denies
  geolocation.
- **Todo** — full add / complete / delete / clear-done flow, all persisted to
  `nexboard_todos`. Items are keyed by `Date.now()`, which later turned up as
  a real bug (see highlight 7).
- **News Feed** — pulls Google News RSS through a CORS proxy, parses it with
  rss2json, supports 7 topic filters, caches results for 15 minutes, and
  formats timestamps as relative time-ago strings.

### 3. Whiteboard widget with canvas persistence
The whiteboard is a freehand canvas (pen and eraser tools, 6 preset colors
plus a custom color picker, adjustable stroke size) paired with a quick-notes
textarea. Both pieces of state — the canvas pixel data and the note text —
are serialized to localStorage on every change so nothing is lost on a page
reload. This required careful handling of the canvas ref lifecycle so that
`toDataURL()` was never called on an unmounted element.

### 4. Dark mode with CSS variable theming
Rather than toggling class names on individual components, dark mode was
implemented as a set of CSS custom properties defined on `:root` and
`[data-theme="dark"]`. A single `data-theme` attribute on `<html>` flips the
entire palette. The preference is stored in `nexboard_theme` and re-applied
on load before React renders, so there is no flash of the wrong theme.

### 5. Drag-and-drop widget reordering
Widgets on the dashboard can be reordered by dragging their handle. The
order is stored in `nexboard_layout` so the arrangement survives a refresh.
Implementing this required tracking drag state without re-rendering the whole
grid on every mouse move — only the final drop triggers a state update and a
localStorage write.

### 6. Choosing Vitest over Jest for the test suite
Since the project uses Vite, Vitest was picked instead of Jest. They share
the same transform pipeline, so there is no mismatch between how app code is
bundled and how tests run. One config block in `vite.config.js` was all it
took to add the test environment.

### 7. Three focused test files covering the whole app
Tests were split into three files with clear responsibilities:

- **Persistence** — do reads and writes round-trip correctly across all ten
  localStorage keys?
- **Errors** — does the app survive corrupt JSON, missing keys, and storage
  quota failures?
- **Responsiveness** — does the UI hold up across viewport changes from
  mobile to widescreen?

Keeping them separate makes failures easy to locate.

### 8. Tests uncovered a real bug in the source code
Two persistence tests failed because `addTodo()` uses `Date.now()` as a
unique ID. When two calls happen within the same millisecond — which is normal
in a test environment — both items get the same ID. Then `deleteTodo()`
removes every item with that ID, wiping both instead of one. The tests were
fixed by seeding localStorage directly with pre-assigned distinct IDs, and
the bug was documented for a future source fix.

### 9. Missing peer dependency caught on first run
The responsiveness tests crashed immediately because `@testing-library/dom`
was not installed, even though `@testing-library/react` was. It is a peer
dependency that npm did not pull in automatically. A second install fixed it
without changing any test code.

### 10. All 50 tests passing
After resolving the peer dependency and the ID-collision tests, the full suite
passed — 17 persistence tests, 17 error tests, and 16 responsiveness tests —
covering every major localStorage key and several failure modes that would
otherwise be invisible at runtime.
