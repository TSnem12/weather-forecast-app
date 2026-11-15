# Weather Forecast App

A live weather dashboard built with HTML, CSS and vanilla JavaScript.
Search any city and get current conditions plus a 5-day forecast.

🔗 **Live demo:** https://tsnem12.github.io/weather-forecast-app/

## Features

- City search with **autocomplete suggestions** (debounced)
- Current temperature, conditions with dynamic icons, humidity, wind speed and pressure
- **5-day forecast** cards built with `Array.map()`
- Loading spinner and friendly error messages for unknown cities or network problems
- Background gradient that changes with the weather (sunny, cloudy, rain, snow, storm, night)
- Mobile-first responsive layout (Flexbox and CSS Grid)

## Tech Stack

- HTML5, CSS3, JavaScript (ES6+)
- Fetch API with `async` / `await` and `try` / `catch` / `finally`
- [Open-Meteo](https://open-meteo.com/) Geocoding and Forecast APIs (no API key required)

## How It Works

1. The city name is sent to the Geocoding API to get its coordinates.
2. The coordinates are sent to the Forecast API to get current weather and daily data.
3. The weather code is translated into text, an icon and a background theme.

## Run Locally

Open `index.html` in your browser. There is no build step.

## Credits

Weather data by [Open-Meteo.com](https://open-meteo.com/), licensed under CC BY 4.0.