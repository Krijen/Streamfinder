---
name: StreamFinder project
description: StreamFinder – movie/series streaming availability lookup site, Norway-focused
type: project
---

React + TypeScript (Vite) frontend, Node.js/Express + TypeScript backend. Uses TMDB API for search and watch providers. Default country: Norway (NO). 13 countries supported.

**Why:** User wants to search movies/series and see which streaming platforms carry them per country.

**How to apply:** Backend at `server/`, client at `client/`. TMDB API key goes in `server/.env`. Proxy: Vite proxies `/api` → `http://localhost:5000`.
