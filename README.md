# NexBoard

A customizable personal dashboard built with React that brings weather, tasks, news, a whiteboard, and a Pomodoro timer into one interface.

## Features

- **Weather Widget** — current conditions via Open-Meteo, with location search and geolocation
- **Todo List** — add, complete, and delete tasks; persisted to localStorage
- **News Feed** — latest headlines via Google News RSS with topic filters
- **Whiteboard** — freehand drawing canvas with pen, eraser, color picker, and quick notes
- **Clock / Pomodoro Widget** — live clock mode and a Pomodoro timer with a visual SVG ring, configurable work/break intervals (default 25 min / 5 min), and localStorage persistence
- **Dark Mode** — full CSS-variable theming, toggled in Settings
- **Drag-and-Drop Layout** — reorder widgets via drag handle; order persisted to localStorage
- **Widget Visibility** — show or hide individual widgets from Settings; preference persisted to localStorage

## Tech Stack

- React 19 + Vite
- React Router v7
- Open-Meteo (weather)
- Google News RSS via rss2json
- localStorage (layout, visibility, todos, whiteboard, Pomodoro settings)
- Netlify

## Development Phases

1. **Scaffold & Deploy** — project setup, routing, sidebar, deploy to Netlify (2–3 hrs)
2. **Weather Widget** — geolocation, Open-Meteo fetch, display conditions (2–3 hrs)
3. **Todo List** — add/complete/delete tasks, persist to localStorage (3–4 hrs)
4. **News Feed** — fetch Google News RSS, parse and display headlines (2–3 hrs)
5. **Whiteboard** — canvas drawing with pen/erase tools (3–4 hrs)
6. **Layout & Polish** — drag-and-drop reorder, dark mode, responsive design, final styling (3–5 hrs)
7. **Widget Visibility** — per-widget show/hide toggles in Settings, persisted to localStorage (1 hr)
8. **Clock / Pomodoro Widget** — live clock mode, SVG ring countdown, configurable intervals, localStorage persistence (2–3 hrs)

## Getting Started

```bash
git clone https://github.com/your-username/nexboard.git
cd nexboard
npm install
npm run dev
```

## APIs Used

**Open-Meteo** — free weather API, no key required
```
https://api.open-meteo.com/v1/forecast?latitude=40.71&longitude=-74.01&current_weather=true
```

**Google News RSS** — free news feed, no key required
```
https://news.google.com/rss/search?q=technology&hl=en-US&gl=US&ceid=US:en
```

## What I Learned

Building NexBoard reinforced how important it is to break a multi-feature project into small, testable phases rather than trying to build everything at once. Working with external data sources like Open-Meteo and Google News RSS taught me how to handle API integration without a backend. The biggest challenge was getting the drag-and-drop layout to work responsively across screen sizes while persisting user preferences in localStorage. Adding the Pomodoro widget introduced new complexity — managing multiple timer states, keeping interval callbacks in sync with current state using refs, and rendering a live SVG progress ring — which pushed my understanding of React hooks and side effects further than any earlier phase. The widget visibility feature showed how a small UX improvement (letting users hide widgets they don't use) can be implemented cleanly by sharing a single localStorage key between the Settings page and the Dashboard. If I had more time, I would add user authentication so multiple people could save their own dashboards and integrate a backend database to sync data across devices. Overall, this project showed how planning upfront with structured phases made each coding session significantly more productive.

## License
- MIT
