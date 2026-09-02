# Dayflow

A mobile-first daily utility app — one place for the calculations, weather, and tasks that actually make up a day. Built with Next.js App Router, wrapped as a native Android app via Capacitor.

## What's inside

**Calculator** — four modes in one screen, switchable via the menu:
- Standard — everyday arithmetic
- Scientific — trig, logs, matrices, complex numbers, number theory (GCD/LCM/prime factorization/combinatorics), descriptive statistics, plus symbolic derivatives, numeric integration, and numeric limits — all powered by [mathjs](https://mathjs.org)
- Programmer — BIN/OCT/DEC/HEX with bitwise operations (AND/OR/XOR/NOT/shifts)
- Unit converter — Length, Weight & Mass, Volume, Temperature, Area, Speed, Time, Power, Energy, Data, Pressure, Angle

**Weather** — live conditions and 3-day forecast via [WeatherAPI.com](https://www.weatherapi.com), with real severe weather alerts, sunrise/sunset, geolocation on load, city search, and a 3D wireframe globe (Three.js) built from real Natural Earth coastline and country-border data — drag to rotate, pinch to zoom, tap a city to jump straight to its forecast.

**Currency Exchange** — live rates via [ExchangeRate-API](https://www.exchangerate-api.com), searchable currency picker, and a quick-glance panel of rates against major currencies.

**Tasks** — a simple, fast to-do list. Full-screen note-style entry, two-column card grid, edit and delete, persisted locally so your list survives closing the app.

## Stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** for styling
- **Three.js** for the 3D globe
- **mathjs** for scientific/symbolic calculation
- **Capacitor** for the native Android wrapper
- Fonts: Bebas Neue (display), Inter (body), JetBrains Mono (all numeric readouts)

## Design

Dark theme throughout — the accent color and a live gradient bar on the home screen actually shift with the real time of day (dawn, midday, dusk, night), which is where the app's name comes from. Numbers are always set in JetBrains Mono so data reads differently from labels at a glance.

## Getting started

```bash
npm install
```

Create `.env.local` in the project root:

WEATHER_API_KEY=your_weatherapi_key
EXCHANGE_RATE_API_KEY=your_exchangerate_api_key

Both keys stay server-side, used only inside `app/api/weather/route.ts` and `app/api/exchange-rate/route.ts` — never exposed to the browser. Do **not** prefix either with `NEXT_PUBLIC_`, that would leak them to every visitor.

Run the dev server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

## Deployment

Auto-deploys to Vercel on every push to `main`. Add both API keys in Vercel's Project Settings → Environment Variables — same rule applies, no `NEXT_PUBLIC_` prefix.

## Android app

The Android build is a thin Capacitor shell pointed at the live Vercel deployment (`capacitor.config.ts`), not a locally bundled copy. That means once it's installed, new features and fixes pushed to `main` show up the next time the app is opened — no rebuild, no reinstall. The shell itself only needs rebuilding if something native changes (app icon, name, permissions).

To rebuild the shell:
```bash
npx cap sync android
npx cap open android
```
Then in Android Studio: **Build → Generate Signed Bundle / APK → APK**.

**Current limitation:** the app requires an internet connection to load, since it isn't bundled locally. The Tasks screen still works fully offline once the app has loaded, since it's stored on-device — everything else needs a connection.

## Project structure


app/
page.tsx home dashboard
calculator/ calculator (all 4 modes)
weather/ weather + 3D globe
currency/ currency converter
todo/ task list
api/
weather/ server-side WeatherAPI proxy
exchange-rate/ server-side ExchangeRate-API proxy
components/
calculator/ scientific / programmer / unit-converter views
globe/ 3D globe + city picker sheet
BottomNav.tsx
DayFlowBar.tsx
lib/
landRings.ts real coastline data (Natural Earth, public domain)
borderLines.ts real country border data (Natural Earth, public domain)
globeCities.ts city coordinates for the globe
units.ts unit conversion tables
scientificMath.ts derivative / integral / limit helpers



## Credits

Coastline and border data: [Natural Earth](https://www.naturalearthdata.com) (public domain, no attribution required).