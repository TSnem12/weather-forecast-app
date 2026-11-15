// ---------- 1. Get data from the API ----------

async function getCity(cityName) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('The weather service is not responding. Please try again later.');
  }

  const data = await response.json();

  if (!data.results) {
    throw new Error(`Could not find "${cityName}". Check the spelling and try again.`);
  }

  return data.results[0];
}

async function getWeather(latitude, longitude) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,surface_pressure,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('The weather service is not responding. Please try again later.');
  }

  const data = await response.json();
  return data;
}


function getWeatherInfo(code, isDay) {
  if (code === 0) {
    return isDay ? { text: 'Clear sky', icon: '☀️' } : { text: 'Clear night', icon: '🌙' };
  }
  if (code <= 2) return { text: 'Partly cloudy', icon: '⛅' };
  if (code === 3) return { text: 'Overcast', icon: '☁️' };
  if (code === 45 || code === 48) return { text: 'Foggy', icon: '🌫️' };
  if (code >= 51 && code <= 57) return { text: 'Drizzle', icon: '🌦️' };
  if (code >= 61 && code <= 67) return { text: 'Rainy', icon: '🌧️' };
  if (code >= 71 && code <= 77) return { text: 'Snowy', icon: '❄️' };
  if (code >= 80 && code <= 82) return { text: 'Rain showers', icon: '🌧️' };
  if (code >= 85 && code <= 86) return { text: 'Snow showers', icon: '❄️' };
  if (code >= 95) return { text: 'Thunderstorm', icon: '⛈️' };
  return { text: 'Unknown', icon: '❓' };
}


function getTheme(code, isDay) {
  if (code >= 95) return 'storm';
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return 'snow';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';
  if (!isDay) return 'night';
  if (code <= 2) return 'sunny';
  return 'cloudy';
}


// ---------- 3. Show it on the page ----------

const weatherSection = document.getElementById('weather');
const cityNameEl = document.getElementById('cityName');
const iconEl = document.getElementById('weatherIcon');
const tempEl = document.getElementById('temp');
const conditionEl = document.getElementById('condition');
const humidityEl = document.getElementById('humidity');
const windEl = document.getElementById('wind');
const pressureEl = document.getElementById('pressure');
const forecastEl = document.getElementById('forecast');
const loaderEl = document.getElementById('loader');
const errorEl = document.getElementById('error');


function showForecast(daily) {
  const days = daily.time.slice(0, 5);

  const cards = days.map((date, index) => {
    const dayName = new Date(date + 'T00:00:00')
      .toLocaleDateString('en-US', { weekday: 'short' });
    const info = getWeatherInfo(daily.weather_code[index], 1);
    const max = Math.round(daily.temperature_2m_max[index]);
    const min = Math.round(daily.temperature_2m_min[index]);

    return `
      <div class="forecast-card">
        <span class="day">${dayName}</span>
        <span class="icon">${info.icon}</span>
        <span class="range">${max}° / ${min}°</span>
      </div>`;
  });

  forecastEl.innerHTML = cards.join('');
}


async function showWeather(cityName, chosenCity) {
  errorEl.hidden = true;
  weatherSection.hidden = true;
  loaderEl.hidden = false;

  try {
   const city = chosenCity || await getCity(cityName);
    const weather = await getWeather(city.latitude, city.longitude);
    const current = weather.current;

    const info = getWeatherInfo(current.weather_code, current.is_day);
    document.body.dataset.theme = getTheme(current.weather_code, current.is_day);

    cityNameEl.textContent = `${city.name}, ${city.country}`;
    iconEl.textContent = info.icon;
    tempEl.textContent = `${Math.round(current.temperature_2m)}°C`;
    conditionEl.textContent = info.text;
    humidityEl.textContent = `${current.relative_humidity_2m}%`;
    windEl.textContent = `${current.wind_speed_10m} km/h`;
    pressureEl.textContent = `${Math.round(current.surface_pressure)} hPa`;

    showForecast(weather.daily);
    weatherSection.hidden = false;

  } catch (error) {
    console.error(error);
    errorEl.textContent = error.message;
    errorEl.hidden = false;

  } finally {
    loaderEl.hidden = true;
  }
}



// ---------- 4. Search form ----------

const searchForm = document.getElementById('searchForm');
const cityInput = document.getElementById('cityInput');

searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const cityName = cityInput.value.trim();
  showWeather(cityName);
});



// ---------- 5. Autocomplete suggestions ----------

const suggestionsEl = document.getElementById('suggestions');
let debounceTimer;

async function searchCities(text) {
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(text)}&count=5`;
    const response = await fetch(url);
    if (!response.ok) return [];
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    return [];
  }
}



let currentSuggestions = [];

function renderSuggestions(cities) {
  currentSuggestions = cities;

  if (cities.length === 0) {
    suggestionsEl.hidden = true;
    return;
  }

  suggestionsEl.innerHTML = cities.map((city, index) => {
    const label = [city.name, city.admin1, city.country]
      .filter(Boolean)
      .join(', ');

    return `<li><button type="button" class="suggestion" data-index="${index}">${label}</button></li>`;
  }).join('');

  suggestionsEl.hidden = false;
}



cityInput.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  const text = cityInput.value.trim();

  if (text.length < 3) {
    suggestionsEl.hidden = true;
    return;
  }

  debounceTimer = setTimeout(async () => {
    const cities = await searchCities(text);
    if (text !== cityInput.value.trim()) return;
    renderSuggestions(cities);
  }, 300);
});



suggestionsEl.addEventListener('click', (event) => {
  const button = event.target.closest('.suggestion');
  if (!button) return;

  const city = currentSuggestions[button.dataset.index];

  clearTimeout(debounceTimer);
  suggestionsEl.hidden = true;
  cityInput.value = city.name;
  showWeather(city.name, city);
});

searchForm.addEventListener('submit', () => {
  clearTimeout(debounceTimer);
  suggestionsEl.hidden = true;
});