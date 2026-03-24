# NexBoard

A customizable personal dashboard built with React that brings weather, tasks, news, and a whiteboard into one interface.

## Features

- **Weather Widget** — current conditions via Open-Meteo
- **Todo List** — add, complete, and delete tasks
- **News Feed** — latest headlines via Google News RSS
- **Whiteboard** — freehand drawing canvas
- **Custom Layout** — drag-and-resize widgets with react-grid-layout

## Tech Stack

- React 18 + Vite
- React Router v6
- Open-Meteo
- Google News RSS
- react-grid-layout
- localStorage
- Netlify

## Development Phases

1. **Scaffold & Deploy** — project setup, routing, sidebar, deploy to Netlify (2–3 hrs)
2. **Weather Widget** — geolocation, Open-Meteo fetch, display conditions (2–3 hrs)
3. **Todo List** — add/complete/delete tasks, persist to localStorage (3–4 hrs)
4. **News Feed** — fetch Google News RSS, parse and display headlines (2–3 hrs)
5. **Whiteboard** — canvas drawing with pen/erase tools (3–4 hrs)
6. **Layout & Polish** — drag-and-resize grid, responsive design, final styling (3–5 hrs)

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

Building NexBoard reinforced how important it is to break a multi-feature project into small, testable phases rather than trying to build everything at once. Working with external data sources like Open-Meteo and Google News RSS taught me how to handle API integration without backend as it is not my strong-suit. The biggest challenge was getting the drag-and-drop layout to work responsively across screen sizes while persisting user preferences in localStorage.  If I had more time, I would add user authentication so multiple people could save their own dashboards, integrate a backend database to sync data across devices, and add more widget options like a calendar or Pomodoro timer. Overall, this project pushed me to think about architecture decisions early and showed how planning upfront with context files and structured prompts made each coding session significantly more productive.

## License
- MIT
