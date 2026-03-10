## Stack
React 18 + Vite, React Router v6, localStorage

## APIs (no keys needed)
Open-Meteo — weather (api.open-meteo.com)
Google News RSS — headlines via CORS proxy

## Key Files
src/components/Layout.jsx — sidebar + Outlet wrapper
src/components/Sidebar.jsx — nav links
src/components/widgets/ — Weather, Todo, News, Whiteboard
src/pages/Dashboard.jsx — widget grid
src/pages/Settings.jsx — preferences
src/hooks/ — useWeather, useNews, useCanvas (not yet created)
src/utils/todoStorage.js — todo CRUD (not yet created)

## localStorage Keys
nexboard_todos, nexboard_layout, nexboard_theme
nexboard_weather_cache, nexboard_whiteboard_canvas
nexboard_whiteboard_notes

## Routes
/ — Dashboard (main view)
/settings — Preferences
